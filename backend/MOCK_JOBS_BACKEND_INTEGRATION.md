# Mock Jobs Backend Integration Guide

## Overview

The backend has been configured to **prioritize the mock job platform** at `http://localhost:3000/mock-jobs` as the PRIMARY target for AI agent job application demos.

When you start the "LinkedIn Job Applier" agent, it will now automatically navigate to and apply for jobs on your local mock job platform instead of external sites like LinkedIn or Indeed.

---

## Changes Made

### 1. Agent Planner Configuration (`backend/src/agent/planner.ts`)

#### Added Mock Job Platform Detection Section
The AI agent can now recognize when it's on the mock job platform by detecting:
- URL patterns (`localhost:3000/mock-jobs` or `/mock-jobs`)
- Page titles ("Find Your Dream Job")
- Gradient company logos (badges with initials like "NT", "CS", "HL")
- Form fields with `data-agent-field` attributes
- Buttons with `data-agent-action` attributes
- 3-step application forms with progress indicators
- Success pages with animated checkmarks and confirmation numbers

#### Updated Navigation Priority
**New Priority Order:**
1. **http://localhost:3000/mock-jobs** (LOCAL MOCK PLATFORM - HIGHEST PRIORITY)
2. Indeed.com
3. LinkedIn Jobs
4. Glassdoor

**Before:**
```typescript
// Preferred job boards (in order): Indeed.com, LinkedIn Jobs, Glassdoor
```

**After:**
```typescript
// **PRIORITY TARGET**: If a local mock job platform is available at http://localhost:3000/mock-jobs, START THERE.
// Preferred job boards (in order): 
//   1. http://localhost:3000/mock-jobs (LOCAL MOCK PLATFORM - HIGHEST PRIORITY)
//   2. Indeed.com
//   3. LinkedIn Jobs
//   4. Glassdoor
```

#### Agent Instructions for Mock Platform
When the agent detects it's on the mock job platform, it will:
1. ✅ Browse jobs by clicking job cards
2. ✅ Click "Apply Now" buttons (detects `data-agent-action="apply_now"`)
3. ✅ Fill multi-step application form (3 steps)
4. ✅ Look for form fields with `data-agent-field` attributes
5. ✅ Submit when all required fields are filled
6. ✅ Wait for success confirmation page

### 2. Frontend Agent Selection (`frontend/src/app/features/dashboard/agents.component.ts`)

Updated the default goal and URL for the "LinkedIn Job Applier" agent:

**Before:**
```typescript
goal = 'Navigate to LinkedIn, search for remote "Frontend Engineer" jobs...';
url = 'https://linkedin.com/jobs';
```

**After:**
```typescript
goal = 'Navigate to the local mock job platform at http://localhost:3000/mock-jobs, browse available positions, select a React Developer or Frontend Engineer role, and complete the full job application form. Use the data-agent-field markers to identify form fields. Submit the application successfully.';
url = 'http://localhost:3000/mock-jobs';
```

Also renamed the agent from "LinkedIn Job Applier" to "LinkedIn Job Seeker" to clarify that it now seeks jobs on the mock platform first.

---

## How It Works

### Agent Flow

1. **User Starts Agent**
   - Clicks "LinkedIn Job Applier" in dashboard
   - Session created with `initial_url: 'http://localhost:3000/mock-jobs'`

2. **Agent Navigates**
   - Browser opens and navigates to mock jobs URL
   - Agent perceives the job board layout

3. **Agent Detects Mock Platform**
   - Recognizes gradient company logos
   - Sees `data-agent-field` and `data-agent-action` attributes
   - Identifies this as the priority target

4. **Agent Browses Jobs**
   - Scans job cards for suitable positions
   - Looks for "React Developer", "Frontend Engineer", etc.
   - Clicks on job card to view details

5. **Agent Applies**
   - Clicks "Apply Now" button
   - Fills out 3-step application form
   - Uses profile data from user memory
   - Submits application

6. **Agent Verifies Success**
   - Waits for confirmation page
   - Confirms submission with timestamp and confirmation number
   - Moves to next job or completes mission

---

## Testing the Integration

### Quick Test

1. **Start Frontend**
   ```bash
   cd frontend && npm run dev
   ```

2. **Start Backend**
   ```bash
   cd backend && npm run dev
   ```

3. **Start Playwright Service**
   ```bash
   cd playwright-service && npm run dev
   ```

4. **Open Dashboard**
   - Navigate to `http://localhost:3000`
   - Login/Register if needed
   - Go to Dashboard → Agents

5. **Start Agent**
   - Click "Start" on "LinkedIn Job Applier"
   - Watch as it navigates to `http://localhost:3000/mock-jobs`
   - Observe agent browsing and applying to jobs

### Expected Behavior

**In Live Session View:**
- Perception shows job board layout
- Tasks include: "Click job card", "Fill form field", "Submit application"
- Agent thoughts mention detecting mock platform markers
- Success rate should be very high (mock platform is designed for reliability)

**Agent Should:**
- ✅ Navigate directly to mock jobs URL
- ✅ Recognize the platform immediately
- ✅ Browse multiple job listings
- ✅ Complete applications successfully
- ✅ Handle form fields using data-agent markers
- ✅ Submit without errors

---

## Agent Markers Reference

The agent uses these markers to interact with the mock platform:

### Form Field Markers (`data-agent-field`)
- `full_name` - Full name input
- `email` - Email address input
- `phone` - Phone number input
- `linkedin_url` - LinkedIn profile URL
- `github_url` - GitHub profile URL
- `portfolio_url` - Portfolio website URL
- `years_of_experience` - Experience level dropdown
- `current_company` - Current employer
- `notice_period` - Notice period dropdown
- `visa_status` - Visa/work authorization status
- `expected_salary` - Salary expectations
- `resume_upload` - Resume file upload zone
- `cover_letter` - Cover letter textarea
- `why_join_us` - Motivation question textarea
- `willing_to_relocate` - Relocation preference radio buttons

### Action Markers (`data-agent-action`)
- `view_job` - View job details button
- `apply_now` - Apply now button
- `start_application` - Start application button
- `next_step` - Next step in form button
- `submit_application` - Submit completed application
- `browse_more_jobs` - Return to job listings

---

## Troubleshooting

### Agent Not Navigating to Mock Jobs

**Check:**
1. Is frontend running on port 3000?
   ```bash
   lsof -ti:3000
   ```

2. Is the initial_url set correctly in session creation?
   - Check browser console for session start payload
   - Verify URL is `http://localhost:3000/mock-jobs`

3. Is the agent recognizing the platform?
   - Check perception output in live session view
   - Look for mentions of "mock job platform" or "data-agent-field"

### Agent Having Trouble with Forms

**Solutions:**
1. **Check marker visibility**
   - Open DevTools on mock jobs page
   - Verify `data-agent-field` attributes are present
   - Example: `<input data-agent-field="email" ...>`

2. **Verify profile data exists**
   - User must have saved profile information
   - Check Settings → Profile for saved data
   - Agent uses this data to fill forms

3. **Watch for obstacles**
   - Agent may encounter CAPTCHA (if enabled via URL params)
   - May need user assistance for missing fields
   - Agent will pause and ask for help when needed

---

## Advanced Configuration

### Enable Demo Obstacles

To test agent's obstacle handling, add query parameters:

**With CAPTCHA:**
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true
```

**With Extra Field:**
```
http://localhost:3000/mock-jobs/1/apply?simulateExtraFormField=true
```

**Both Obstacles:**
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
```

### Custom Agent Goals

You can customize agent behavior by modifying the goal in session creation:

```typescript
{
  goal: 'Apply to 5 senior React developer positions on the mock job platform',
  options: {
    initial_url: 'http://localhost:3000/mock-jobs',
    max_actions: 50
  }
}
```

---

## Benefits of This Approach

### For Development
- ✅ **Predictable testing environment** - Mock platform always behaves consistently
- ✅ **No rate limiting** - Apply to as many jobs as needed
- ✅ **No CAPTCHAs** (unless enabled intentionally)
- ✅ **Fast iteration** - Instant loading, no network delays
- ✅ **Full control** - You own the platform behavior

### For Demos
- ✅ **Reliable** - No unexpected failures from external sites
- ✅ **Professional** - Clean, modern UI impresses stakeholders
- ✅ **Educational** - Clear agent markers show how AI automation works
- ✅ **Customizable** - Add obstacles to demonstrate problem-solving
- ✅ **Measurable** - Track success rates and performance metrics

### For Production
- ✅ **Scalable** - Can handle unlimited demo sessions
- ✅ **Documented** - All markers and workflows clearly defined
- ✅ **Maintainable** - Easy to update or extend functionality
- ✅ **Safe** - No risk of blocking or banning from real sites

---

## Future Enhancements

Potential improvements:

1. **Multiple Mock Platforms**
   - Add different job board designs
   - Simulate various ATS systems
   - Practice with different form layouts

2. **Advanced Obstacles**
   - Multi-page application forms
   - Video interview simulations
   - Skills assessment tests
   - Personality questionnaires

3. **Analytics Dashboard**
   - Track application success rates
   - Measure time per application
   - Identify common failure points
   - Generate performance reports

4. **Profile Optimization**
   - A/B test different resume formats
   - Optimize form filling strategies
   - Learn from successful applications

---

## Summary

Your AI agent is now configured to **automatically use the mock job platform** as its primary target for job applications. This provides:

- 🎯 **Focused targeting** - Agent goes straight to mock jobs
- 🤖 **Smart detection** - Agent recognizes mock platform features
- ⚡ **Fast execution** - No external dependencies or delays
- 📊 **Reliable demos** - Consistent, professional results
- 🔧 **Easy testing** - Full control over environment

**Next Step:** Start the agent and watch it navigate to `http://localhost:3000/mock-jobs` and begin applying to jobs automatically!
