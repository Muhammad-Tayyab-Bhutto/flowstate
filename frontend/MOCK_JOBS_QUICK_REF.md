# Mock Job Platform - Quick Reference Card

## 🚀 Quick Start

1. **Start the server**: Already running at `http://localhost:3000`
2. **Navigate to**: Click "Mock Jobs" in navbar or go to `/mock-jobs`
3. **Demo URL**: `http://localhost:3000/mock-jobs`

## 🎯 Demo Flow (5 minutes)

### 1. Browse Jobs (30 seconds)
```
http://localhost:3000/mock-jobs
```
- Show search: Type "React" or "AI"
- Show filters: Location, Job Type
- Hover effects on cards

### 2. View Job Details (30 seconds)
Click "React Developer" → Shows full job description

### 3. Apply Now (3 minutes)
Click "Apply Now" → Multi-step form

**Step 1: Basic Info**
- Auto-fillable fields with agent markers
- All fields have `data-agent-field="*"` attributes

**Step 2: Professional Info**
- Dropdowns and text fields
- Resume upload zone
- Cover letter textarea

**Step 3: Additional Questions**
- Why join us?
- Relocation preference
- Submit button

### 4. Success Screen (30 seconds)
- Confirmation number
- Timestamp
- Next steps

## 🤖 Agent Markers Cheat Sheet

### Key Form Fields
```html
data-agent-field="full_name"
data-agent-field="email"
data-agent-field="phone"
data-agent-field="linkedin_url"
data-agent-field="github_url"
data-agent-field="visa_status"
data-agent-field="expected_salary"
data-agent-field="resume_upload"
data-agent-field="cover_letter"
```

### Key Actions
```html
data-agent-action="view_job"
data-agent-action="apply_now"
data-agent-action="start_application"
data-agent-action="next_step"
data-agent-action="submit_application"
```

## 🎪 Demo Obstacles (Optional)

### Add CAPTCHA Challenge
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true
```

### Add Extra Field
```
http://localhost:3000/mock-jobs/1/apply?simulateExtraFormField=true
```

### Combine Both
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
```

## 📋 Sample Jobs

| Position | Company | Location | Salary |
|----------|---------|----------|--------|
| React Developer | NovaTech | San Francisco | $120k-$160k |
| Frontend Engineer | CloudScale | Remote | $130k-$170k |
| Full Stack Developer | HyperLabs | New York | $140k-$180k |
| AI Engineer | QuantumSoft | Boston | $150k-$200k |
| ML Engineer | AIVision | Palo Alto | $160k-$210k |

## ✨ Visual Features to Highlight

1. **Company Logos**: Gradient badges with initials
2. **Hover Effects**: Cards lift on hover
3. **Success Animation**: Checkmark pops in
4. **Progress Stepper**: Shows application steps
5. **Responsive Design**: Works on mobile/tablet/desktop

## 🎨 Design Highlights

- **Modern UI**: Card-based layouts
- **Professional Typography**: Inter font family
- **Color Palette**: Indigo/Purple gradients
- **Material Design**: Angular Material components
- **Tailwind CSS**: Utility-first styling

## 🔧 Technical Stack

- Angular 21 (Standalone Components)
- Angular Material
- Tailwind CSS
- Reactive Forms
- In-memory data service

## 📱 Testing URLs

### Direct Links to Specific Jobs
```
Job #1 (React):     /mock-jobs/1
Job #2 (Frontend):  /mock-jobs/2
Job #3 (Full Stack):/mock-jobs/3
Job #4 (AI):        /mock-jobs/4
Job #5 (Product):   /mock-jobs/5
```

### Application Forms with Obstacles
```
Normal:             /mock-jobs/1/apply
+ CAPTCHA:          /mock-jobs/1/apply?simulateCaptcha=true
+ Extra Field:      /mock-jobs/1/apply?simulateExtraFormField=true
+ Both:             /mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
```

## 💡 Pro Tips

1. **Search is instant** - Type and results filter immediately
2. **Form validation is real-time** - Shows errors as you type
3. **No login required** - Completely open for demos
4. **Data is in-memory** - Refreshes reset everything
5. **All buttons work** - Even file uploads (simulated)

## 🎬 Perfect Demo Script

> "Let me show you our mock job platform designed for AI automation demos..."
> 
> 1. "Here's our job board with 10 realistic positions..."
> 2. "Notice the modern UI similar to LinkedIn..."
> 3. "Let's apply for this React Developer role..."
> 4. "The AI agent can detect all fields via data-agent markers..."
> 5. "Multi-step form with validation..."
> 6. "Optional obstacles like CAPTCHA can be enabled..."
> 7. "Success page with confirmation..."
> 8. "Ready for your hackathon demo!"

---

**🎯 You're all set! The platform is production-ready for your demo.**
