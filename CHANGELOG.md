# Changelog

All notable changes to this project during the UI/UX overhaul and feature completion phase will be documented in this file.

## [Unreleased]
- Improved `lib/gemini.ts` JSON parser to fix AI Predictive Insights API failures and incorrect issue categorizations.
- Wrapped `useSearchParams` in a Suspense boundary in Officer Analytics to prevent Next.js hydration flashing.
- Made `PublicNavbar` auth-aware to display "My Dashboard" instead of "Sign In" for logged-in users.
- Fixed Community Discussion section to allow comments from all signed-in users, not just reporters.
- Added photo removal capabilities to the Officer Profile page.
- Fixed file input caching bug in user profiles to allow immediate re-uploading without page refresh.
- Updated Leaderboard to render profile images instead of initial letters.

## [2026-06-26]

### Added
- **Google Sign-In Role Selection**: New Google users are now prompted with a beautiful modal to select their role (Citizen, Field Officer, Supervisor) instead of defaulting to Citizen.
- **About Page** (`/about`): Created a rich About Us page with Devanagari headlines, problem statement, solution features, Google tech stack showcase, and timeline.
- **Help Center** (`/help`): Created a comprehensive Help Center with searchable FAQs, category filters, contact info, and quick action links.
- **Citizen Map Page** (`/citizen/map`): Added an interactive map visualization for citizens to view reported issues around them.
- **Officer Assigned Page** (`/officer/assigned`): Created a dashboard for field officers to view and manage tasks assigned to them, allowing status updates (In Progress, Resolved).
- **Officer Profile Page** (`/officer/profile`): Added profile page for officers with avatar upload, editable details, and account security status.
- **Officer Map Page** (`/officer/map`): Implemented a map specifically styled for officers to track assignments in their ward.
- **Supervisor Profile Page** (`/supervisor/profile`): Added profile page tailored for supervisors.
- **Admin Users Page** (`/admin/users`): Created a user management page that allows administrators to view all users, filter by role, and critically, **approve pending Field Officer and Supervisor accounts**.
- **Supervisor Map Page** (`/supervisor/map`): Created an interactive map tailored for supervisors to monitor issues across their entire assigned zone.
- **Supervisor Analytics Page** (`/supervisor/analytics`): Implemented a performance analytics dashboard featuring Gemini AI Predictive Insights.
- **Admin Issues Page** (`/admin/issues`): Built a master view of all reported platform issues, allowing administrators to search, filter by status, and assign unresolved issues directly to Field Officers.
- **Admin Analytics Page** (`/admin/analytics`): Created a platform-wide analytics page showing total system metrics and mock service health status for external APIs.
- **Admin Settings Page** (`/admin/settings`): Added a settings configuration page allowing control over general platform behavior, AI strictness levels, and notifications.
- **Supervisor Issues Page** (`/supervisor/issues`): Created a dedicated issues management page for Supervisors to allot work directly to Field Officers and validate resolved issues.

### Changed
- **Authentication Context** (`lib/auth-context.tsx`): Updated to support `pendingGoogleUser` state and `completeGoogleSignup` to enable the role selection modal.
- **Authentication Context — Real-time Profile** (`lib/auth-context.tsx`): Switched from one-shot `getDoc` to `onSnapshot` for user profile. Photo uploads, name edits, and points changes now propagate instantly across the entire app without a page refresh.
- **Signup Page** (`/auth/signup/page.tsx`): Integrated the new Google role selection modal. Added Indian cultural elements like mandala patterns and Devanagari text ("जन सेवा, जन शक्ति").
- **Global CSS** (`/app/globals.css`): Massive UI overhaul. Added Devanagari fonts, Indian color themes (saffron gradients), mandala backgrounds, enhanced glassmorphism, and new utility classes for a premium feel.
- **Root Layout** (`/app/layout.tsx`): Integrated `Noto Sans Devanagari` font and updated metadata with Hindi text.
- **Dashboard Layout** (`/components/layout/DashboardLayout.tsx`): Redesigned sidebar and topbar. Added highly visible logout button in its own dedicated section, Hindi labels for navigation, user photo support, role-specific color theming, and an AI badge indicator.
- **Report Issue Flow** (`/citizen/report/page.tsx`): AI integration is now **mandatory and integral**. Gemini AI automatically analyzes the issue title, description, and attached photos upon submission to assign severity, categorize the issue, and predict a resolution timeframe.
- **Supervisor Analytics** (`/supervisor/analytics/page.tsx`): Replaced UI mockups with a direct backend connection to `/api/ai/insights`, pulling real predictive analysis based on live database. Fixed the data payload to pass structured stats instead of raw issue array. **Added `recharts`** library to render real, dynamic "Issues by Category" (Pie chart) and "Issue Status Breakdown" (Bar chart) visualizations.
- **Officer Analytics Page** (`/supervisor/officer-analytics/page.tsx`): **New feature**. Added a dynamic per-officer analytics page that shows individual assignment history, resolution rates, and personalized Recharts visualizations. The "View Performance" button in the Supervisor Officers page now dynamically routes here.
- **Supervisor Officers Page** (`/supervisor/officers/page.tsx`): Replaced hardcoded "12" issues count with live data fetched per-officer. Now shows: Total Assigned, In Progress, and Resolution Rate (%) for each officer.
- **AI Insights Route** (`/api/ai/insights/route.ts`): Fixed JSON parsing — Gemini returns a raw string which now gets parsed and field-normalized (`insight`/`action` → `desc`, type auto-detected) before sending to frontend.
- **Admin/Supervisor Validation** (`/admin/issues/page.tsx`, `/supervisor/issues/page.tsx`): Supervisors and Admins can now "Validate & Close" issues once they are resolved by field officers.

### Fixed
- **Dashboard Flashing Issue** (`/components/layout/DashboardLayout.tsx`): Fixed a severe bug where navigating between pages would flash a "Citizen" dashboard layout to Supervisors/Officers for a split second. The layout now respects `useAuth().loading` and displays a centered loading spinner until the user's role is confirmed.
- **Citizen Profile Photo Removal** (`/citizen/profile/page.tsx`): Added a "Remove Photo" (trash) button overlay on the avatar when a photo exists, allowing users to clear their uploaded image and revert to their initial-based default avatar.
- **Officer Assigned Issues Missing 'Closed'** (`/officer/assigned/page.tsx`): Fixed an issue where tasks marked as "closed" by a supervisor would still show as pending/in-progress for the field officer. Added a dedicated "Closed ✅" tab to the officer's dashboard.
- **Leaderboard Fix** (`lib/firestore.ts`): Fixed the leaderboard query failure by implementing an in-memory sorting fallback for when the Firestore composite index is missing.
- **Cloudinary Upload Config** (`/api/upload/route.ts`): Explicitly set `cloud_name`, `api_key`, and `api_secret` from `.env.local` instead of relying on `CLOUDINARY_URL` auto-parse. Confirmed working with live test (SVG upload returned valid Cloudinary URL).
- **Upload Error Messages** (`/api/upload/route.ts`): Improved error handling to properly extract Cloudinary's nested `error.message` format instead of returning "Unknown error".
- **Citizen My Reports — Flash Empty State** (`/citizen/my-reports/page.tsx`): Added `loading` state so the page shows a spinner until Firebase subscription returns data, preventing the "Write your first issue" message from briefly flashing.
- **Logout Cache Issue** (`lib/auth-context.tsx`): Fixed a bug where logging out wouldn't visually remove the dashboard state by forcing a hard browser redirect (`window.location.href`).
- **Google Login Role Selection Bug** (`/auth/login/page.tsx`): Extracted `GoogleRoleModal` into a reusable component and injected it into the Login page so first-time users can't accidentally bypass role selection when signing in via Google.
- **Supervisor Officers — "View Performance" Not Working** (`/supervisor/officers/page.tsx`): Changed the button to a real `<Link>` navigating to the Analytics page.
