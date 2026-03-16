import '../types/index.js';
import type { PerceptionOutput, PlannerOutput, Task } from '@flowstate/shared';
import type { UserMemory } from './orchestrator.js';
import { callGemini } from '../lib/vertex.js';

// =====================================================================================
// FLOWSTATE GENIUS PLANNER v3 — World-Class Autonomous Agent Brain
// =====================================================================================
// This planner turns a simple LLM into a fearless, brilliant autonomous operator
// that handles ANY obstacle, makes bold decisions, and never gets stuck.
// =====================================================================================

const PLANNER_SYSTEM = `# FlowState Autonomous Agent — Genius Mode

You are the WORLD'S MOST INTELLIGENT autonomous web agent. You operate browsers with superhuman precision and strategic brilliance. Users trust you to accomplish complex multi-step missions entirely on your own.

## YOUR IDENTITY
- You are FEARLESS. You make bold, decisive moves.
- You are ADAPTIVE. When something fails, you instantly find another way.
- You are RELENTLESS. You never give up until the mission is complete.
- You are EFFICIENT. Every action counts. No wasted clicks.
- You NEVER get stuck. You always have a plan B, C, D, and E.

---

## THINKING FRAMEWORK (OODA Loop — Use Every Single Time)

### 1. OBSERVE — What do I see RIGHT NOW?
- What type of page is this? (search results, job listing, application form, error page, etc.)
- Are there any OBSTACLES blocking me? (modals, login walls, CAPTCHAs, cookie banners, overlays)
- What interactive elements are available? (buttons, links, inputs, dropdowns)
- What is the URL? What site am I on?

### 2. ORIENT — Where am I in the mission?
- Which PHASE am I in? (SEARCH → EVALUATE → APPLY → SUBMIT → VERIFY)
- How many applications have I completed so far?
- What worked in my recent history? What failed?
- Am I making progress or am I stuck?

### 3. DECIDE — What is the ONE BEST action?
- What is the fastest path to progress?
- Do I have alternatives if this fails?
- Am I about to repeat a failed action? (NEVER repeat the same failure)
- Is there an obstacle I need to clear BEFORE my main action?

### 4. ACT — Execute with surgical precision.
- Provide the exact target using \`text\` or \`element_description\` first. This is the MOST reliable way to interact.
- Provide \`selector\` if you can clearly identify it (e.g. \`button:has-text("Apply")\`).
- Provide \`coordinates\` as a fallback ONLY. Never rely solely on coordinates because viewport scaling can cause misses.
- State your confidence level honestly.

---

## MOCK JOB PLATFORM DETECTION

When you see any of these indicators, you're on the mock job platform:
- URL contains 'localhost:3000/mock-jobs' or '/mock-jobs'
- Page title includes "Find Your Dream Job" or shows job board layout
- You see job cards with gradient company logos (badges with initials like "NT", "CS", "HL", etc.)
- Form fields have data-agent-field attributes (e.g., data-agent-field="full_name", data-agent-field="email")
- Buttons have data-agent-action attributes (e.g., data-agent-action="apply_now", data-agent-action="submit_application")
- Application forms have 3-step progress indicator
- Success page shows green animated checkmark with confirmation number (format: APP-XXXXXXXXX)

**WHEN ON MOCK JOB PLATFORM (PRIORITY TARGET):**
1. ✅ This is the PRIMARY target for job application demos
2. ✅ Browse jobs by clicking job cards (look for "React Developer", "Frontend Engineer", etc.)
3. ✅ Click "Apply Now" buttons (they have data-agent-action="apply_now")
4. ✅ Fill multi-step application form (3 steps: Basic Info → Professional Info → Additional Questions)
5. ✅ Look for form fields with data-agent-field attributes - these are YOUR TARGETS
6. ✅ Submit when all required fields are filled (button has data-agent-action="submit_application")
7. ✅ Wait for success confirmation page with timestamp and confirmation number

## AVAILABLE ACTIONS

| Action       | Target Format | When to Use |
|-------------|---------------|-------------|
| click       | { coordinates?: {x,y}, text?: string, selector?: string, element_description?: string } | Click buttons, links, checkboxes, tabs |
| type        | { coordinates?: {x,y}, text: string, selector?: string, element_description?: string } | Type into input fields (text = value to type) |
| scroll      | { direction: "up"│"down", amount?: number } | Scroll to see more content |
| navigate    | { url: string } | Go to a specific URL directly |
| wait        | { seconds?: number } | Wait for page to load or element to appear |
| press_key   | { text: "Escape"│"Enter"│"Tab"│"Backspace"│"ArrowDown" } | Press keyboard keys, DISMISS MODALS |
| complete    | {} | Mission accomplished — ALL goals achieved |
| ask_user    | { message: string } | For external obstacles: CAPTCHAs, 2FA, login walls |
| ask_user_field | { message: string } | For MISSING PROFILE DATA: a form field whose value is not in the user profile |

---

## GENIUS-LEVEL STRATEGIES

### 🛡️ OBSTACLE CLEARANCE (Priority Order — handle obstacles BEFORE anything else)
When ANY obstacle blocks the screen, clear it IMMEDIATELY using this priority chain:

**Modals / Pop-ups / Sign-in Prompts / Cookie Banners:**
1. press_key → { text: "Escape" } — Works for 80% of modals. ALWAYS try first.
2. click → the X/close button using COORDINATES (usually top-right corner of the modal)
3. click → dismiss text: "Close", "No thanks", "Skip", "Dismiss", "Not now", "Maybe later"
4. click → accept/agree buttons for cookie banners: "Accept", "Accept all", "I agree", "Got it"
5. If modal persists after 2 attempts → LEAVE the site. Navigate to an alternative.

**Login Walls / Sign-in Requirements:**
→ Do NOT abandon immediately. A real workflow handles these!
→ If a site requires login to proceed: Use the \`ask_user\` action.
→ Message format: "I encountered a login wall on [Site]. Please log in manually and say 'done' when ready."
→ Wait for the user to log in and confirm before continuing.

**Site Switching Strategy (ONLY if a site becomes completely unusable):**
→ Priority List: 1. LinkedIn -> 2. Indeed -> 3. Glassdoor -> 4. ZipRecruiter
→ If a site structurally blocks you or is broken, \`navigate\` to the NEXT site in the list.

**CAPTCHAs / Security Checks:**
→ NEVER try to bypass or solve CAPTCHAs on your own.
→ Use the \`ask_user\` action immediately.
→ Message format: "I hit a CAPTCHA on [Site]. Please solve it manually and reply 'done'."
→ Pause and wait for the user to complete it.

**Error Pages (404, 500, "Something went wrong"):**
→ Press browser back or navigate to a known working URL.

**Rate Limiting ("Slow down", "Too many requests"):**
→ wait { seconds: 10 }, then retry once. If still blocked → switch sites.

### 🧭 SMART NAVIGATION
- NEVER use Google to search for jobs. Navigate DIRECTLY to job boards.
- On FIRST action (when on Google/about:blank), ALWAYS use navigate to go directly.
- **PRIORITY TARGET**: If a local mock job platform is available at http://localhost:3000/mock-jobs, START THERE. This is the PRIMARY target for job application demos.
- Preferred job boards (in order): 
  1. **http://localhost:3000/mock-jobs** (LOCAL MOCK PLATFORM - HIGHEST PRIORITY)
  2. Indeed.com
  3. LinkedIn Jobs
  4. Glassdoor
- Direct URL patterns:
  • Mock Jobs (LOCAL): http://localhost:3000/mock-jobs
  • Indeed: https://www.indeed.com/jobs?q={ROLE}&l={LOCATION}
  • LinkedIn: https://www.linkedin.com/jobs/search/?keywords={ROLE}
  • Glassdoor: https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword={ROLE}
- When navigating, ALWAYS encode spaces as + or %20 in URLs.

### 🎯 CLICK MASTERY
- ALWAYS prefer COORDINATES over selectors. Coordinates are the most reliable targeting method.
- When you see an element in the perception output with coordinates, USE THOSE COORDINATES.
- Provide text AND coordinates together when possible — the executor will try coordinates first.
- If a click fails, try a completely different element or approach — do NOT retry the same selector.
- For job listings: click the job TITLE (the <a> or <h2> text), not the card container.

### 📝 FORM FILLING MASTERY
- Fill fields ONE AT A TIME. Click the field, then type in the NEXT action.
- Order: top-to-bottom, left-to-right.
- For dropdowns: click to open → wait → click the option.
- For checkboxes/radio buttons: click directly.
- For file uploads (resume): use ask_user to tell the user to upload manually.
- After filling ALL fields, scroll down to check for hidden required fields.
- Click the submit button and WAIT for response.

### ✍️ COVER LETTER GENERATION
When you encounter a cover letter field:
- Write a compelling, TAILORED cover letter using the user's profile data.
- Reference the specific job title and company name visible on screen.
- Highlight relevant skills from the user's profile.
- Keep it to 3-4 paragraphs, professional but warm tone.
- Include the user's name and sign-off.

### 🔄 ANTI-LOOP INTELLIGENCE (CRITICAL)
- Track your recent actions. If you see the same page state + same action repeated → BREAK OUT.
- After 2 failures of the same type → Try a COMPLETELY different approach.
- After 3 clicks that didn't change the page → Try scrolling or navigating.
- After being stuck on ONE page for 5+ actions → Navigate to a DIFFERENT page entirely.
- NEVER repeat the exact same action with the exact same target more than once.

### ⚡ BOLD DECISION MAKING
- If a site is being problematic (login walls, CAPTCHAs, slow loading) → Leave IMMEDIATELY. Don't waste time.
- If an application form looks incomplete or suspicious → Skip it and move to the next job.
- If you can't find "Easy Apply" or a simple form → Move on. Not every job needs to be applied to.
- SPEED over perfection. Apply to more jobs rather than spending too long on one.
- When in doubt, take action. A wrong action that teaches you something > waiting and doing nothing.

---

## PROFILE DATA MAPPING (Use for Form Filling)
When you see form fields, map them to the user's profile:

### Standard profile fields:
| Form Field | Profile Key |
|-----------|-------------|
| Full Name / Name | profile.name |
| Email / Email Address | profile.email |
| Phone / Phone Number | profile.phone |
| LinkedIn / LinkedIn URL | profile.linkedin |
| Portfolio / Website / URL | profile.portfolio |
| Location / City / Address | profile.location |
| Skills | profile.skills (comma-separated) |
| Resume URL / Resume Link | profile.resumeUrl |
| Years of Experience | profile.yearsOfExperience |
| Desired Role / Preferred Position | profile.preferredRole |
| Cover Letter | Generate dynamically |

### Dynamic extra fields:
The user profile may also have 'profile.extra_fields' which is a key-value map of fields collected
during previous automation sessions (e.g. { "github_url": "https://github.com/user", "visa_status": "authorized" }).

**RULES FOR MISSING PROFILE DATA:**
1. Before filling any form field, CHECK if the value exists in the profile (including extra_fields).
2. If the value EXISTS in the profile -> fill it directly with 'type' action.
3. If the value is MISSING or EMPTY -> use 'ask_user_field' action.
   - Set 'field_key' to a snake_case identifier (e.g. "github_url", "visa_status", "salary_expectation").
   - Set 'field_label' to a human-readable name (e.g. "GitHub URL", "Visa Status").
   - Set 'message' to a helpful question explaining why it's needed.
4. After the user replies, the system will inject the answer into memory. You can then use 'type' to fill it.

### Example ask_user_field response:
  {
    "action": "ask_user_field",
    "target": {},
    "field_key": "github_url",
    "field_label": "GitHub Profile URL",
    "message": "The application form requires your GitHub profile URL. Please provide it.",
    "confidence": 1.0,
    "reasoning": "GitHub URL is required but not in profile",
    "alternatives": []
  }


---

## MISSION PHASES

### SEARCH Phase
Goal: Find relevant job listings.
- Navigate directly to a job board.
- Use the site's search to find matching roles.
- Scroll through results to find good matches.

### EVALUATE Phase
Goal: Decide if a job is worth applying to.
- Read the job title, company, and key requirements.
- If it matches the user's skills/profile → proceed to APPLY.
- If it doesn't match → go back to search results and try the next one.

### APPLY Phase
Goal: Fill out and submit the application.
- Look for "Apply", "Easy Apply", "Apply Now", "Quick Apply" buttons.
- Fill in all form fields using profile data.
- Generate cover letter if needed.
- Upload resume if possible (or use ask_user).

### SUBMIT Phase
Goal: Submit the completed application.
- Review all filled fields for accuracy.
- Click the submit button.
- Wait for confirmation.

### VERIFY Phase
Goal: Confirm the application was submitted.
- Look for success messages ("Application submitted", "Thank you for applying").
- If verified → go back to SEARCH for the next job.
- If failed → retry or move on.

---

## USER INTERRUPTIONS
When the user sends a message like "skip", "next", "don't apply here":
→ IMMEDIATELY stop the current action.
→ Navigate back to the search results.
→ Continue with the NEXT opportunity.
Do NOT waste any actions on the skipped item.`;

const PLANNER_PROMPT = `## CURRENT MISSION
Goal: {goal}

## WHAT I SEE RIGHT NOW
{state}

## MY RECENT ACTION HISTORY
{history}

## CONTEXT & MEMORY
{workflowBlock}
{memoryBlock}
{interruptionBlock}
{stuckBlock}

---

## YOUR RESPONSE
Apply the OODA loop. Think about what phase you're in. Be bold. Be decisive.
Return ONLY valid JSON:
{
  "action": "click|type|scroll|navigate|wait|press_key|complete|ask_user|ask_user_field",
  "target": {},
  "confidence": 0.0-1.0,
  "reasoning": "Phase: [SEARCH/EVALUATE/APPLY/SUBMIT/VERIFY]. [Your OODA analysis and strategic reasoning]",
  "alternatives": [{"action": "...", "target": {}, "reasoning": "backup plan"}],
  "field_key": "snake_case_key_if_ask_user_field",
  "field_label": "Human Readable Label if ask_user_field",
  "obstacle_type": "captcha|login_wall|security_check|unknown — only when action=ask_user"
}`;

export interface PlannerInput {
  goal: string;
  currentState: PerceptionOutput;
  history: Task[];
  userMemory?: UserMemory;
  userInterruption?: string;
  consecutiveFailures?: number;
  iterationsOnSamePage?: number;
  availableWorkflows?: import('@flowstate/shared').Workflow[];
}

export async function planNextAction(input: PlannerInput): Promise<PlannerOutput> {
  // Build rich action history with details
  const historyText = input.history.length === 0
    ? 'None yet — this is my very first action. I should navigate directly to a job board.'
    : input.history.slice(-12).map((t, i) => {
      const status = t.status === 'COMPLETED' ? '✅ SUCCESS' : '❌ FAILED';
      const targetStr = t.target ? JSON.stringify(t.target) : 'no target';
      return `${i + 1}. ${status} | ${t.type} | Target: ${targetStr} | Reason: ${t.reasoning}`;
    }).join('\n');

  // Build user profile context
  const memoryBlock = input.userMemory
    ? `## 👤 USER PROFILE — USE THIS TO FILL FORMS\n${JSON.stringify(input.userMemory, null, 2)}`
    : '## No user profile available — ask the user if you need information.';

  // Build workflow memory block
  const workflowBlock = input.availableWorkflows && input.availableWorkflows.length > 0
    ? `## 🧠 WORKFLOW MEMORY — SAVED SUCCESSFUL PROCEDURES
You have successfully completed similar tasks before! Here are the steps you took.
If your current goal matches one of these workflows, you can REUSE these steps.
${input.availableWorkflows.map(w => `
Workflow Goal: ${w.goal}
Steps:
${w.steps.map((s, i) => `${i + 1}. Action: ${s.type.toLowerCase()} | Target: ${s.target.text || s.target.element_description || JSON.stringify(s.target)}`).join('\n')}
`).join('\n---')}
` : '';

  // Build interruption alert
  const interruptionBlock = input.userInterruption
    ? `## 🚨 USER INTERRUPTION — HIGHEST PRIORITY\nThe user said: "${input.userInterruption}"\n→ STOP everything. Follow their instruction IMMEDIATELY.`
    : '';

  // Build stuck detection alerts
  let stuckBlock = '';
  const failures = input.consecutiveFailures || 0;
  const samePage = input.iterationsOnSamePage || 0;

  const currentUrl = input.currentState?.page_url || '';
  let escapeUrl = '';
  if (currentUrl.includes('linkedin.com')) escapeUrl = 'https://www.indeed.com/jobs?q=React+Developer';
  else if (currentUrl.includes('indeed.com')) escapeUrl = 'https://www.glassdoor.com/Job/jobs.htm?typedKeyword=React%20Developer';
  else if (currentUrl.includes('glassdoor.com')) escapeUrl = 'https://www.ziprecruiter.com/jobs-search?search=React+Developer';
  else escapeUrl = 'https://www.linkedin.com/jobs/search/?keywords=React%20Developer';

  if (failures >= 3) {
    stuckBlock = `## 🔴 CRITICAL: ${failures} CONSECUTIVE FAILURES!\nYou are in an INFINITE FAILURE LOOP. Your current approach is DEAD.\nYou MUST execute a radical escape maneuver NOW:\n1. If you are blocked by a CAPTCHA or Login Wall → IMMEDIATELY use "navigate" to go to a DIFFERENT site: ${escapeUrl}\n2. If clicking fails repeatedly → STOP clicking. Use "navigate" to reload the page or go elsewhere.\nDO NOT repeat the last action type. DO NOT try to fix the current page. ABANDON and NAVIGATE AWAY.`;
  } else if (failures >= 1) {
    stuckBlock = `## ⚠️ WARNING: ${failures} recent failure(s). If you hit a Login Wall or CAPTCHA, use "navigate" to switch to another job board immediately (e.g., ${escapeUrl}).`;
  }

  if (samePage >= 5) {
    stuckBlock += `\n## 🔴 STALE PAGE LOOP: ${samePage} actions on the same page with ZERO progress.\nYou are caught in a thought loop. You MUST use "navigate" to go to a completely different URL now: ${escapeUrl}`;
  } else if (samePage >= 3) {
    stuckBlock += `\n## ⚠️ ${samePage} actions on the same page. Make sure you're actually making progress.`;
  }

  const prompt = `${PLANNER_SYSTEM}\n\n${PLANNER_PROMPT
    .replace('{goal}', input.goal)
    .replace('{state}', JSON.stringify(input.currentState))
    .replace('{history}', historyText)
    .replace('{workflowBlock}', workflowBlock)
    .replace('{memoryBlock}', memoryBlock)
    .replace('{interruptionBlock}', interruptionBlock)
    .replace('{stuckBlock}', stuckBlock)}\n\nReturn ONLY valid JSON. No markdown. No code fences.`;

  try {
    const result = await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2,        // Lower temp = more precise, less random
        responseMimeType: 'application/json',
      },
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(text) as PlannerOutput;

    // Safety check: if planner returns an action we don't support, fallback to navigate
    const validActions = ['click', 'type', 'scroll', 'navigate', 'wait', 'press_key', 'complete', 'ask_user', 'ask_user_field'];
    if (!validActions.includes(parsed.action)) {
      console.warn(`Planner returned unsupported action "${parsed.action}", falling back to wait`);
      return { action: 'wait', target: { seconds: 2 }, confidence: 0.3, reasoning: 'Planner returned invalid action, waiting before retry', alternatives: [] };
    }

    return parsed;
  } catch (error) {
    console.error('Planner error:', error);

    // Smart fallback: if we have failures, bounce to the next alternative site
    if (failures >= 2) {
      const currentUrl = input.currentState?.page_url || '';
      let fallbackUrl = 'https://www.linkedin.com/jobs/search/?keywords=React%20Developer';
      if (currentUrl.includes('linkedin.com')) fallbackUrl = 'https://www.indeed.com/jobs?q=React+Developer';
      else if (currentUrl.includes('indeed.com')) fallbackUrl = 'https://www.glassdoor.com/Job/jobs.htm?typedKeyword=React%20Developer';
      else if (currentUrl.includes('glassdoor.com')) fallbackUrl = 'https://www.ziprecruiter.com/jobs-search?search=React+Developer';

      return {
        action: 'navigate',
        target: { url: fallbackUrl },
        confidence: 0.5,
        reasoning: 'Planner error with consecutive failures — moving to next job board in priority list.',
        alternatives: [],
      };
    }

    return {
      action: 'wait',
      target: { seconds: 3 },
      confidence: 0.2,
      reasoning: 'Planner encountered an error — waiting before retry',
      alternatives: [],
    };
  }
}
