# Mock Job Platform - URL Reference

## Base URLs

### Main Application
```
http://localhost:3000/mock-jobs
```
The main job board with all listings, search, and filters.

---

## Job Listings

### All Jobs (Default View)
```
http://localhost:3000/mock-jobs
```
Shows all 10 job postings in a grid layout.

### Filtered Views (via UI)
- Search by typing in search box
- Filter by location dropdown
- Filter by job type dropdown

---

## Individual Job Details

### Job #1 - React Developer
```
http://localhost:3000/mock-jobs/1
```
NovaTech • San Francisco, CA • $120k-$160k

### Job #2 - Frontend Engineer
```
http://localhost:3000/mock-jobs/2
```
CloudScale • Remote • $130k-$170k

### Job #3 - Full Stack Developer
```
http://localhost:3000/mock-jobs/3
```
HyperLabs • New York, NY • $140k-$180k

### Job #4 - AI Engineer
```
http://localhost:3000/mock-jobs/4
```
QuantumSoft • Boston, MA • $150k-$200k

### Job #5 - Product Engineer
```
http://localhost:3000/mock-jobs/5
```
BrightEdge • Seattle, WA • $135k-$175k

### Job #6 - Backend Developer
```
http://localhost:3000/mock-jobs/6
```
TechFlow • Austin, TX • $125k-$165k

### Job #7 - DevOps Engineer
```
http://localhost:3000/mock-jobs/7
```
DataPeak • Denver, CO • $140k-$180k

### Job #8 - ML Engineer
```
http://localhost:3000/mock-jobs/8
```
AIVision • Palo Alto, CA • $160k-$210k

### Job #9 - Software Engineer
```
http://localhost:3000/mock-jobs/9
```
CodeCraft • Chicago, IL • $130k-$170k

### Job #10 - Platform Engineer
```
http://localhost:3000/mock-jobs/10
```
ScaleUp • Miami, FL • $135k-$175k

---

## Application Forms

### Standard Application (No Obstacles)
```
http://localhost:3000/mock-jobs/1/apply
http://localhost:3000/mock-jobs/2/apply
http://localhost:3000/mock-jobs/3/apply
http://localhost:3000/mock-jobs/4/apply
... etc
```

### With CAPTCHA Simulation
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true
http://localhost:3000/mock-jobs/2/apply?simulateCaptcha=true
http://localhost:3000/mock-jobs/3/apply?simulateCaptcha=true
http://localhost:3000/mock-jobs/4/apply?simulateCaptcha=true
... etc
```

### With Extra Form Field
```
http://localhost:3000/mock-jobs/1/apply?simulateExtraFormField=true
http://localhost:3000/mock-jobs/2/apply?simulateExtraFormField=true
http://localhost:3000/mock-jobs/3/apply?simulateExtraFormField=true
http://localhost:3000/mock-jobs/4/apply?simulateExtraFormField=true
... etc
```

### With Both Obstacles
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
http://localhost:3000/mock-jobs/2/apply?simulateCaptcha=true&simulateExtraFormField=true
http://localhost:3000/mock-jobs/3/apply?simulateCaptcha=true&simulateExtraFormField=true
http://localhost:3000/mock-jobs/4/apply?simulateCaptcha=true&simulateExtraFormField=true
... etc
```

### With Login Wall Simulation
```
http://localhost:3000/mock-jobs/1/apply?simulateLoginWall=true
http://localhost:3000/mock-jobs/2/apply?simulateLoginWall=true
... etc
```

### All Obstacles Combined
```
http://localhost:3000/mock-jobs/1/apply?simulateLoginWall=true&simulateCaptcha=true&simulateExtraFormField=true
```

---

## Success Page

### After Submission
```
http://localhost:3000/mock-jobs/success?jobTitle=React%20Developer&companyName=NovaTech&confirmationNumber=APP-ABC123&submittedAt=2026-03-16T15:30:00Z
```
(Automatically navigated to after successful submission)

---

## Quick Test Sequences

### Basic Demo Flow (Clean)
1. http://localhost:3000/mock-jobs
2. http://localhost:3000/mock-jobs/1
3. http://localhost:3000/mock-jobs/1/apply
4. Fill form → Submit → Success page

### Demo with CAPTCHA Challenge
1. http://localhost:3000/mock-jobs
2. http://localhost:3000/mock-jobs/4 (AI Engineer)
3. http://localhost:3000/mock-jobs/4/apply?simulateCaptcha=true
4. Complete CAPTCHA → Fill form → Submit

### Demo with Unexpected Field
1. http://localhost:3000/mock-jobs
2. http://localhost:3000/mock-jobs/2 (Frontend Engineer)
3. http://localhost:3000/mock-jobs/2/apply?simulateExtraFormField=true
4. Notice extra field → Handle gracefully → Submit

### Full Obstacle Demo
1. http://localhost:3000/mock-jobs
2. http://localhost:3000/mock-jobs/3
3. http://localhost:3000/mock-jobs/3/apply?simulateCaptcha=true&simulateExtraFormField=true
4. Handle both obstacles → Submit

---

## Agent Testing URLs

### For Automated Testing
Start here for consistent agent demos:
```
http://localhost:3000/mock-jobs
```

### Recommended Demo Job
Job #1 (React Developer) is ideal for demos:
```
http://localhost:3000/mock-jobs/1
http://localhost:3000/mock-jobs/1/apply
```

### High-Paying Tech Jobs
For impressive demos, use Job #8 (ML Engineer):
```
http://localhost:3000/mock-jobs/8
http://localhost:3000/mock-jobs/8/apply?simulateCaptcha=true
```

### Remote Position
Job #2 (Frontend Engineer) is fully remote:
```
http://localhost:3000/mock-jobs/2
http://localhost:3000/mock-jobs/2/apply
```

---

## Navigation Shortcuts

### From Anywhere in App
- Click "Mock Jobs" button in navbar
- Or navigate to `/mock-jobs`

### Direct Access
Bookmark these for quick demo access:
- Main board: `/mock-jobs`
- Apply form: `/mock-jobs/1/apply`
- Success page: (automatic after submission)

---

## Search Query Examples

### In-App Search Terms
Type these in the search box to test:
- "React" → Shows React Developer, Full Stack Developer
- "AI" → Shows AI Engineer, ML Engineer
- "Remote" → Shows Frontend Engineer
- "Engineer" → Shows all engineering positions
- "NovaTech" → Shows specific company

### Skill-Based Searches
- "TypeScript" → Multiple matches
- "Python" → AI/ML roles
- "React" → Frontend roles
- "AWS" → DevOps/Backend roles

---

## Browser Tabs Setup

### Ideal Demo Setup
Open these tabs before starting demo:

**Tab 1**: Job Board
```
http://localhost:3000/mock-jobs
```

**Tab 2**: Target Job
```
http://localhost:3000/mock-jobs/1
```

**Tab 3**: Application Form
```
http://localhost:3000/mock-jobs/1/apply
```

**Tab 4**: With Obstacles (optional)
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
```

This allows instant switching during the demo without navigation delays.

---

## Mobile Testing

### Responsive URLs
All URLs work on mobile devices:
- iPhone/iPad: Safari browser
- Android: Chrome browser
- Desktop: Chrome/Firefox/Safari/Edge

Test responsive design:
```
http://localhost:3000/mock-jobs
```
Then resize browser or use device emulator.

---

## Performance Testing

### Load Time Check
```
http://localhost:3000/mock-jobs
```
Should load instantly (< 1 second) since it's all in-memory.

### Form Responsiveness
```
http://localhost:3000/mock-jobs/1/apply
```
Form validation should be real-time with no lag.

---

## Troubleshooting URLs

### If Main Page Doesn't Load
Check if server is running:
```
http://localhost:3000
```
Should show Flowstate landing page.

### If Assets Missing
Clear browser cache and reload:
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Check Console
Open DevTools (F12) and check for errors in Console tab.

---

## Production Demo Checklist

✅ Server running on port 3000
✅ Can access http://localhost:3000/mock-jobs
✅ All job cards display correctly
✅ Job detail pages load
✅ Application form works
✅ Form validation active
✅ Submit redirects to success page
✅ Optional obstacles enabled (if needed)
✅ Agent markers detectable
✅ No console errors

---

**Quick Start Command:**
```bash
# Already running! Just open:
http://localhost:3000/mock-jobs
```

**Preview Browser:** Available via tool panel button.
