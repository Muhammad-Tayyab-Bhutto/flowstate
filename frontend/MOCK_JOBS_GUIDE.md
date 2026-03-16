# Mock Job Platform - Demo Guide

## Overview
A professional mock job platform designed for demonstrating AI job-application agent capabilities. This platform simulates a realistic job board and application workflow similar to LinkedIn or Indeed, without login restrictions, CAPTCHA blocks, or anti-bot protections.

## Access
Once your frontend server is running, navigate to:
```
http://localhost:3000/mock-jobs
```

You can also click "Mock Jobs" in the navigation bar.

## Features

### 1. Job Listings Page
- **Grid Layout**: Modern card-based design with company logos
- **Search & Filters**: Search by title, company, or skills
- **Filter Options**: By location and job type
- **Job Cards Display**:
  - Job title
  - Company name and logo
  - Location
  - Salary range ($120k-$200k+)
  - Job type badge (Full-time, Remote, etc.)
  - Time posted
  - Skills tags
  - "View Details" and "Apply Now" buttons

### 2. Job Detail Page
Comprehensive job information including:
- Full job description
- Key responsibilities (bulleted list)
- Requirements (bulleted list)
- Skills & technologies (chip badges)
- Company overview section
- Benefits & perks
- Apply CTA buttons

### 3. Application Form
Multi-step application process with three sections:

#### Step 1: Basic Information
- Full Name (required)
- Email Address (required)
- Phone Number (required)
- LinkedIn URL (required)
- GitHub URL (optional)
- Portfolio URL (optional)

#### Step 2: Professional Information
- Years of Experience (dropdown)
- Current Company (text input)
- Notice Period (dropdown)
- Visa Status (dropdown)
- Expected Salary (text input)
- Resume Upload (drag & drop zone)
- Cover Letter (textarea)

#### Step 3: Additional Questions
- "Why do you want to join this company?" (textarea)
- "Are you willing to relocate?" (radio buttons)
- Terms acceptance notice

### 4. Success Page
After submission, displays:
- Success confirmation with animated checkmark
- Position details (job title, company)
- Confirmation number
- Submission timestamp
- Next steps information
- "Browse More Jobs" button

## Agent-Friendly Markers

All interactive elements include `data-agent-*` attributes for reliable automation:

### Form Fields (`data-agent-field`)
- `job_search` - Search input
- `location_filter` - Location dropdown
- `type_filter` - Job type dropdown
- `full_name` - Full name input
- `email` - Email input
- `phone` - Phone input
- `linkedin_url` - LinkedIn URL
- `github_url` - GitHub URL
- `portfolio_url` - Portfolio URL
- `years_of_experience` - Experience dropdown
- `current_company` - Current company input
- `notice_period` - Notice period dropdown
- `visa_status` - Visa status dropdown
- `expected_salary` - Expected salary input
- `resume_upload` - Resume upload area
- `cover_letter` - Cover letter textarea
- `why_join_us` - Why join us textarea
- `willing_to_relocate` - Relocation radio buttons
- `confirmation_number` - Confirmation number display
- `submission_timestamp` - Submission timestamp

### Action Buttons (`data-agent-action`)
- `view_job` - View job details button
- `apply_now` - Apply now button
- `start_application` - Start application button
- `next_step` - Next step button
- `submit_application` - Submit application button
- `verify_captcha` - CAPTCHA verification checkbox
- `browse_more_jobs` - Browse more jobs button

## Demo Obstacles (Optional)

To demonstrate real-world challenge handling, enable these via URL parameters:

### 1. Login Wall Simulation
Add `?simulateLoginWall=true` to any URL
```
http://localhost:3000/mock-jobs/1/apply?simulateLoginWall=true
```
Shows a modal asking user to continue as guest.

### 2. CAPTCHA Simulation
Add `?simulateCaptcha=true` to application form URL
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true
```
Displays a fake reCAPTCHA checkbox that must be verified before submission.

### 3. Extra Form Field
Add `?simulateExtraFormField=true` to application form URL
```
http://localhost:3000/mock-jobs/1/apply?simulateExtraFormField=true
```
Adds an unexpected "Reference Name" field not present in the standard profile.

### Combine Multiple Obstacles
```
http://localhost:3000/mock-jobs/1/apply?simulateCaptcha=true&simulateExtraFormField=true
```

## Sample Jobs

The platform includes 10 realistic job postings:

1. **React Developer** @ NovaTech - San Francisco, CA ($120k-$160k)
2. **Frontend Engineer** @ CloudScale - Remote ($130k-$170k)
3. **Full Stack Developer** @ HyperLabs - New York, NY ($140k-$180k)
4. **AI Engineer** @ QuantumSoft - Boston, MA ($150k-$200k)
5. **Product Engineer** @ BrightEdge - Seattle, WA ($135k-$175k)
6. **Backend Developer** @ TechFlow - Austin, TX ($125k-$165k)
7. **DevOps Engineer** @ DataPeak - Denver, CO ($140k-$180k)
8. **ML Engineer** @ AIVision - Palo Alto, CA ($160k-$210k)
9. **Software Engineer** @ CodeCraft - Chicago, IL ($130k-$170k)
10. **Platform Engineer** @ ScaleUp - Miami, FL ($135k-$175k)

## Complete Demo Flow

### Ideal Demonstration Sequence:

1. **Navigate to Job Board**
   ```
   http://localhost:3000/mock-jobs
   ```

2. **Browse Jobs**
   - Show search functionality
   - Demonstrate filters
   - Hover over job cards (show animations)

3. **Select a Job**
   - Click on "React Developer" position
   - Review job details page
   - Show company information and benefits

4. **Start Application**
   - Click "Apply Now" button
   - Navigate to multi-step form

5. **Fill Application Form**
   - **Step 1**: Enter basic information
     - Agent can detect fields via `data-agent-field` attributes
     - Auto-fill known profile data
   
   - **Step 2**: Professional information
     - Select from dropdowns
     - Handle file upload simulation
     - Fill cover letter
   
   - **Step 3**: Additional questions
     - Answer "Why join us?"
     - Select relocation preference

6. **Handle Obstacles** (if enabled)
   - Pause on unexpected CAPTCHA
   - Request user assistance
   - Demonstrate obstacle resolution

7. **Submit Application**
   - Click submit button
   - Show loading state
   - Navigate to success page

8. **Success Confirmation**
   - Display confirmation number
   - Show submission timestamp
   - Provide next steps

## Technical Details

### Architecture
- **Frontend**: Angular 21 with standalone components
- **UI Framework**: Angular Material + Tailwind CSS
- **Routing**: Angular Router with lazy loading
- **State**: In-memory data service (no backend required)
- **Forms**: Reactive Forms with validation

### Performance
- Instant load time
- No external API calls
- No authentication required
- Runs completely locally
- Optimized bundle size with lazy loading

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari

## Design Highlights

### Professional UI Elements
- Modern gradient company logos
- Card-based layouts with hover effects
- Smooth transitions and animations
- Responsive design (mobile-friendly)
- Success page with pop animation
- Progress stepper for application flow

### Color Scheme
- Primary: Indigo (#667eea)
- Accent: Purple (#764ba2)
- Success: Emerald (#10b981)
- Neutral: Slate gray palette

## Troubleshooting

### Application Not Loading
1. Ensure frontend server is running: `npm run dev`
2. Check console for errors
3. Verify port 3000 is available

### Styles Not Applying
1. Clear browser cache
2. Check if Tailwind CSS is loading
3. Verify Angular Material themes

### Form Validation Issues
1. Check browser console for validation errors
2. Ensure all required fields are filled
3. Verify email format is correct

## Future Enhancements

Potential additions for extended demos:
- User profile persistence
- Application history tracking
- Email notification simulation
- Interview scheduling workflow
- Admin dashboard for employers
- Advanced analytics dashboard

## Support

For issues or questions about the mock job platform, check the main Flowstate documentation or contact the development team.

---

**Note**: This is a demonstration platform. All data is stored in memory and will be lost on page refresh. No actual applications are submitted to real companies.
