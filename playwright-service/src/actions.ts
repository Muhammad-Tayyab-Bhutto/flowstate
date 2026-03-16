import type { Page } from 'playwright';

export interface ActionTarget {
  selector?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  url?: string;
  element_description?: string;
  direction?: string;
  amount?: number;
}

export interface ActionRequest {
  session_id: string;
  action: string;
  target: ActionTarget;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

const ACTION_TIMEOUT = 10000; // 10 seconds

/**
 * Execute an action on the page
 */
export async function executeAction(
  page: Page,
  action: string,
  target: ActionTarget
): Promise<ActionResult> {
  try {
    switch (action.toLowerCase()) {
      case 'click':
        return await executeClick(page, target);

      case 'type':
        return await executeType(page, target);

      case 'scroll':
        return await executeScroll(page, target);

      case 'navigate':
        return await executeNavigate(page, target);

      case 'wait':
        return await executeWait(page, target);

      case 'press_key':
        return await executePressKey(page, target);

      case 'screenshot':
        return { success: true };

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// RESILIENT CLICK — tries EVERY possible strategy
// ============================================
async function executeClick(page: Page, target: ActionTarget): Promise<ActionResult> {
  const errors: string[] = [];

  // Strategy 1: CSS selector (exact DOM match, most reliable if provided accurately)
  if (target.selector) {
    try {
      const locator = page.locator(target.selector).first();
      if (await locator.isVisible({ timeout: 1000 })) {
        await locator.click({ timeout: ACTION_TIMEOUT, force: true });
        return { success: true };
      }
    } catch (err) {
      errors.push(`selector(${target.selector}): ${(err as Error).message}`);
    }
  }

  // Strategy 2: Text matching — try many variations (Playwright's strength)
  if (target.text) {
    const text = target.text.trim();
    const textStrategies = [
      () => page.getByRole('button', { name: text, exact: true }).first(),
      () => page.getByRole('link', { name: text, exact: true }).first(),
      () => page.getByRole('button', { name: text }).first(),
      () => page.getByRole('link', { name: text }).first(),
      () => page.getByText(text, { exact: true }).first(),
      () => page.getByText(text).first(),
      () => page.locator(`text="${text}"`).first(),
      () => page.locator(`[aria-label="${text}" i]`).first(),
      () => page.locator(`[title="${text}" i]`).first(),
      () => page.locator(`input[type="submit"][value="${text}" i]`).first(),
      () => page.locator(`input[type="button"][value="${text}" i]`).first()
    ];

    for (const getLocator of textStrategies) {
      try {
        const locator = getLocator();
        if (await locator.isVisible({ timeout: 500 })) {
          // Sometimes elements are covered, force=true helps in automation
          await locator.click({ timeout: ACTION_TIMEOUT, force: true });
          return { success: true };
        }
      } catch {
        // try next
      }
    }
    errors.push(`text(${text}): Could not find visible clickable element`);
  }

  // Strategy 3: element_description as partial text or label match
  if (target.element_description) {
    const desc = target.element_description;
    const descStrategies = [
      () => page.getByLabel(desc).first(),
      () => page.getByPlaceholder(desc).first(),
      () => page.getByRole('button', { name: desc }).first(),
      () => page.getByRole('link', { name: desc }).first(),
      () => page.getByText(desc).first()
    ];

    for (const getLocator of descStrategies) {
      try {
        const locator = getLocator();
        if (await locator.isVisible({ timeout: 500 })) {
          await locator.click({ timeout: ACTION_TIMEOUT, force: true });
          return { success: true };
        }
      } catch {
        // try next
      }
    }
    errors.push(`element_description(${desc}): not found`);
  }

  // Strategy 4: Coordinates (Fallback — highly dependent on viewport scaling)
  // We do this LAST because visual LLM coordinate guesses are often inaccurate
  if (target.coordinates) {
    try {
      // Ensure we're within viewport bounds just in case
      const vp = page.viewportSize() || { width: 1920, height: 1080 };
      const x = Math.max(0, Math.min(target.coordinates.x, vp.width - 1));
      const y = Math.max(0, Math.min(target.coordinates.y, vp.height - 1));

      await page.mouse.click(x, y);
      await page.waitForTimeout(300); // Let the page react
      return { success: true };
    } catch (err) {
      errors.push(`coordinates(${target.coordinates.x},${target.coordinates.y}): ${(err as Error).message}`);
    }
  }

  return { success: false, error: `All click strategies failed: ${errors.join('; ')}` };
}

// ============================================
// RESILIENT TYPE
// ============================================
async function executeType(page: Page, target: ActionTarget): Promise<ActionResult> {
  if (!target.text) {
    return { success: false, error: 'No text provided for type action' };
  }

  const textToType = target.text;

  // Helper to reliably clear and type
  const clearAndType = async (locator: any) => {
    await locator.click({ timeout: 2000, force: true });
    // Ctrl+A often fails in SPAs. Triple-click is more reliable to select all text.
    await locator.click({ clickCount: 3, timeout: 2000, force: true });
    await page.keyboard.press('Backspace');
    await locator.fill(textToType, { timeout: ACTION_TIMEOUT });
    return { success: true };
  };

  // Strategy 1: CSS selector
  if (target.selector) {
    try {
      const locator = page.locator(target.selector).first();
      if (await locator.isVisible({ timeout: 1000 })) {
        return await clearAndType(locator);
      }
    } catch {
      // fall through
    }
  }

  // Strategy 2: element_description/placeholder/label matching (very common for forms)
  if (target.element_description) {
    const desc = target.element_description;
    const strategies = [
      () => page.getByLabel(desc, { exact: true }).first(),
      () => page.getByPlaceholder(desc, { exact: true }).first(),
      () => page.getByLabel(desc).first(),
      () => page.getByPlaceholder(desc).first(),
      () => page.locator(`input[name*="${desc}" i]`).first(),
      () => page.locator(`input[aria-label*="${desc}" i]`).first()
    ];

    for (const getLocator of strategies) {
      try {
        const locator = getLocator();
        if (await locator.isVisible({ timeout: 500 })) {
          return await clearAndType(locator);
        }
      } catch {
        // try next
      }
    }
  }

  // Strategy 3: Coordinates (Fallback)
  if (target.coordinates) {
    try {
      const vp = page.viewportSize() || { width: 1920, height: 1080 };
      const x = Math.max(0, Math.min(target.coordinates.x, vp.width - 1));
      const y = Math.max(0, Math.min(target.coordinates.y, vp.height - 1));

      await page.mouse.click(x, y);
      await page.waitForTimeout(200);
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(textToType, { delay: 30 });
      return { success: true };
    } catch {
      // fall through
    }
  }

  // Strategy 4: If we have NOTHING else, try typing blindly where the focus already is
  try {
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(textToType, { delay: 30 });
    return { success: true };
  } catch {
    // last resort failed
  }

  return { success: false, error: 'All type strategies failed to find input' };
}

// ============================================
// SCROLL
// ============================================
async function executeScroll(page: Page, target: ActionTarget): Promise<ActionResult> {
  const direction = target.direction || 'down';
  const amount = target.amount || 500;

  if (target.selector) {
    try {
      await page.locator(target.selector).scrollIntoViewIfNeeded({ timeout: ACTION_TIMEOUT });
      return { success: true };
    } catch {
      // fall through to default scroll
    }
  }

  const delta = direction === 'up' ? -amount : amount;
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(500);
  return { success: true };
}

// ============================================
// NAVIGATE — with fallback wait strategies
// ============================================
async function executeNavigate(page: Page, target: ActionTarget): Promise<ActionResult> {
  if (!target.url) {
    return { success: false, error: 'No URL provided for navigate action' };
  }

  try {
    // Use domcontentloaded instead of networkidle — much more reliable for modern SPAs
    await page.goto(target.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    // Give the page a moment to render dynamic content
    await page.waitForTimeout(2000);
    return { success: true };
  } catch (err) {
    // Sometimes the page navigates but takes too long — check if URL changed
    const currentUrl = page.url();
    if (currentUrl.includes(new URL(target.url).hostname)) {
      return { success: true }; // We got there even if it "timed out"
    }
    return { success: false, error: (err as Error).message };
  }
}

// ============================================
// WAIT
// ============================================
async function executeWait(page: Page, target: ActionTarget): Promise<ActionResult> {
  if (target.selector) {
    try {
      await page.waitForSelector(target.selector, {
        state: 'visible',
        timeout: ACTION_TIMEOUT,
      });
    } catch {
      // Non-fatal — the element might not appear, keep going
    }
  } else if (target.text) {
    try {
      await page.waitForSelector(`text="${target.text}"`, {
        state: 'visible',
        timeout: ACTION_TIMEOUT,
      });
    } catch {
      // Non-fatal
    }
  } else {
    // Default: just wait a fixed time
    const seconds = (target as any).seconds || 3;
    await page.waitForTimeout(seconds * 1000);
  }

  return { success: true };
}

// ============================================
// PRESS KEY
// ============================================
async function executePressKey(page: Page, target: ActionTarget): Promise<ActionResult> {
  const key = target.text || target.selector || 'Escape';
  await page.keyboard.press(key);
  await page.waitForTimeout(500);
  return { success: true };
}
