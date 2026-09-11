# Hackathon Platform
 
A miniature hackathon management platform — applicants sign in and submit role-specific applications; organizers review, score, and track them through a live admin dashboard.
 
**Live demo:** [https://hacker-base-32rb.vercel.app/]
**Test Credentials for Admin Side**: `test@test.test` password: `test`
 
## Overview
 
This project covers the full applicant-to-decision lifecycle for a hackathon: sign-up and application submission on one side, review and grading on the other, backed by Supabase with row-level security enforcing who can see and edit what.

## Features
 
### Applicant side
- Email/password sign-up with real email confirmation (no accounts activate without verifying ownership of the email)
- Role-specific application forms that support **hacker, judge, mentor, and volunteer** applications, each with its own fields
- Team codes so hackers can apply together as a group
### Organizer side
- Full applications table with search, filtering, and status at a glance
- Per-application review view with options accept / reject / waitlist, and a numeric score and free-text notes
- Live status updates with no full-page reload (optimistic UI)
- CSV export of all applications
- Organizer management (root organizers can promote other accounts to organizer)
