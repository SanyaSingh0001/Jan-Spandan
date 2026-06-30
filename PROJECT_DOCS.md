# Community Hero - Hyperlocal Problem Solver

## 1. Problem Statement Selected
**Community Hero - Hyperlocal Problem Solver**
Communities face fragmented, untraceable reporting systems for local issues (potholes, streetlights, waste). There is a lack of transparency and collaboration between citizens and municipal bodies.

## 2. Solution Overview
We have built a unified platform that connects citizens directly with field officers and supervisors. 
By utilizing AI categorization and geo-mapping, the reporting process is simplified. A gamified point system encourages citizens to participate, verify reports, and track resolution transparently.

## 3. Key Features
- **Role-Based Workspaces**: 
  - **Citizens**: Report issues, track status, view the community map, and earn badges.
  - **Field Officers**: View assigned tasks on the ground, update statuses (In Progress -> Resolved), and upload proof.
  - **Supervisors**: Monitor analytics, view AI predictive insights, and manage resources.
  - **Admins**: Handle user approvals and system oversight.
- **AI-Powered Categorization**: Google Gemini analyzes issue descriptions/images to suggest categories, estimate severity, and assign departments automatically.
- **Geo-Location & Mapping**: Google Maps integration places every issue on an interactive community map.
- **Community Verification**: Citizens can upvote real issues to validate them and increase priority.
- **Predictive AI Insights**: Supervisors get AI-generated insights on potential hotspots based on historical data.

## 4. Technologies Used
- **Frontend Framework**: Next.js 14 (App Router), React, TypeScript
- **Styling & UI**: Tailwind CSS, Framer Motion (for animations), Lucide React (Icons)
- **Media Storage**: Cloudinary (For image/video uploads)

## 5. Google Technologies Utilized (Evaluation Criteria)
To maximize evaluation points, we heavily integrated the Google ecosystem:
1. **Google Firebase Authentication**: For secure login (Email/Password & Google Sign-In).
2. **Google Cloud Firestore**: Real-time NoSQL database holding all issues, users, and comments.
3. **Google Gemini 2.0 Flash API**: Powering automatic issue categorization, severity prediction, and supervisor predictive insights.
4. **Google Maps JavaScript API**: For the interactive community map and location detection.
5. **Google Cloud Run**: The application is fully containerized with a Dockerfile and optimized (via `next.config.ts` standalone output) for deployment on Google Cloud Run.
