import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  createdAt: Date;
}

export class BrowserManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private readonly maxSessions = 50;
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
  }

  /**
   * Create a new browser session
   */
  async createSession(sessionId: string, initialUrl?: string): Promise<Page> {
    try {
      // Check if session already exists
      if (this.sessions.has(sessionId)) {
        const existing = this.sessions.get(sessionId)!;
        return existing.page;
      }

      // Check max sessions
      if (this.sessions.size >= this.maxSessions) {
        // Close oldest session
        const oldest = this.getOldestSession();
        if (oldest) {
          await this.closeSession(oldest);
        }
      }

      // Launch browser with stealth settings to avoid bot detection
      const browser = await chromium.launch({
        headless: process.env['HEADLESS'] !== 'false', // Default to true for stability on Linux servers
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-size=1920,1080',
        ],
      });

      // Create context with realistic browser fingerprint
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        javaScriptEnabled: true,
        bypassCSP: true,
      });

      // Create page
      const page = await context.newPage();

      // Handle popups/new tabs — when "Apply now" opens in a new tab, auto-switch to it
      context.on('page', async (newPage) => {
        try {
          await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
          // Update the session to point to the new page
          const session = this.sessions.get(sessionId);
          if (session) {
            session.page = newPage;
          }
        } catch {
          // ignore new tab load errors
        }
      });

      // Navigate to initial URL if provided
      if (initialUrl && initialUrl !== 'about:blank') {
        try {
          await page.goto(initialUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(2000); // Let dynamic content render
        } catch {
          // Non-fatal — page might still load
        }
      }

      // Store session
      this.sessions.set(sessionId, {
        browser,
        context,
        page,
        createdAt: new Date(),
      });

      return page;
    } catch (error) {
      console.error('Browser launch error:', error);
      throw error;
    }
  }

  /**
   * Get page for a session
   */
  getPage(sessionId: string): Page | null {
    const session = this.sessions.get(sessionId);
    return session?.page ?? null;
  }

  /**
   * Close a session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        await session.context.close();
        await session.browser.close();
      } catch {
        // Ignore close errors
      }
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Close all sessions
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.sessions.keys()).map((id) =>
      this.closeSession(id)
    );
    await Promise.allSettled(closePromises);
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get oldest session ID
   */
  private getOldestSession(): string | null {
    let oldest: { id: string; date: Date } | null = null;

    for (const [id, session] of this.sessions) {
      if (!oldest || session.createdAt < oldest.date) {
        oldest = { id, date: session.createdAt };
      }
    }

    return oldest?.id ?? null;
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();

    for (const [id, session] of this.sessions) {
      if (now - session.createdAt.getTime() > this.sessionTimeout) {
        await this.closeSession(id);
      }
    }
  }
}
