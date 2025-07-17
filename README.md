# Blood Donation Portal (eBloodCare)

A full-stack web application for managing blood donation and requests, connecting donors, patients, and hospitals. Built with Node.js, Express, MongoDB, and a modern responsive frontend.

## Features

- **Landing Page:** Overview, statistics, and quick links to register as a donor or request blood.
- **User Authentication:** Sign up and login with secure password hashing (bcrypt).
- **Dashboard:** Personalized dashboard for users to view stats, recent activity, update profile, and upload profile pictures.
- **Blood Request Form:** Patients can request blood by filling out a detailed form.
- **Donor Registration:** Donors can register and provide their details and availability.
- **Find Blood:** Search for available blood in the nearest hospitals using geolocation.
- **Blog & Gallery:** Informational blog and gallery showcasing donation drives and stories.
- **Why Donate:** Educational page on the importance of blood donation.
- **Session Management:** User sessions managed securely with express-session.
- **Profile Picture Upload:** Users can upload and update their profile pictures.
- **Admin/Role Support:** User roles for future admin features (currently basic user/donor roles).

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Frontend:** HTML, CSS (custom, modern.css), JavaScript
- **Authentication:** bcrypt for password hashing, express-session for sessions
- **File Uploads:** multer for profile pictures

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB database (Atlas or local)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd BLOOD DONATION PBL
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure MongoDB:
   - Update the MongoDB connection string in `server.js` if needed.
4. Start the server:
   ```bash
   node server.js
   ```
5. Open your browser and go to [http://localhost:3050](http://localhost:3050)

## Project Structure

- `server.js` - Main Express server, routes, and database models
- `public/` - Static assets (CSS, JS, images)
- `views/` - HTML views for all pages (Home, Dashboard, Forms, Blog, Gallery, etc.)

## Usage

- **Register as a Donor:** Fill out the Donor Registration form.
- **Request Blood:** Fill out the Patient Request form.
- **Find Blood:** Use the Find Blood page to search for available blood in nearby hospitals.
- **User Dashboard:** View your stats, recent activity, and update your profile.
- **Blog & Gallery:** Read about blood donation and view event photos.


## Acknowledgements
- Built for educational purposes and to promote blood donation awareness.
- Inspired by real-world needs for efficient blood management systems. 