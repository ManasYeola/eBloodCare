# 🩸 eBloodCare — Blood Donation Portal

*A full-stack web application connecting donors, patients, and hospitals for faster, smarter blood donation and request management.*

eBloodCare streamlines the process of registering donors, requesting blood, and searching available units near you — all through a responsive, modern interface built with Node.js, Express, MongoDB, and custom frontend design.

---

## 🚀 Features

- 🏠 **Dynamic Landing Page:** Live stats and quick access to key actions  
- 🔐 **User Authentication:** Secure login & registration  
- 📊 **Personal Dashboard:** Track stats, recent activity, and manage your profile  
- 📝 **Blood Request & Donor Forms:** Easy forms for patients and donors  
- 📍 **Find Blood Nearby:** Geolocation-based search for available blood  
- 💬 **Live Chat Support:** Real-time help via Tawk.to chat widget  
- 📰 **Blog & Gallery:** Stories and photos from donation events  
- ❓ **Why Donate:** Educational content on blood donation  

---

## 🛠️ Tech Stack

| Layer       | Technologies                                |
|-------------|---------------------------------------------|
| **Backend** | Node.js, Express.js                         |
| **Database**| MongoDB (Mongoose ODM)                      |
| **Frontend**| HTML, CSS (custom + modern.css), JavaScript |
| **Auth**    | bcrypt (password hashing), express-session  |
| **Uploads** | multer (for profile image uploads)          |

---

## 📁 Project Structure

```text
BLOOD DONATION PBL/
├── public/         # Static assets (CSS, JS, images)
├── views/          # HTML templates
├── server.js       # Main server file
├── package.json    # Project metadata and dependencies
└── README.md       # Project documentation
```

---

## ⚙️ Getting Started

### 📦 Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 🧪 Installation

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd "BLOOD DONATION PBL"
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure MongoDB**
   - Create a `.env` file in the project root:
     ```
     MONGODB_URI=your-mongodb-connection-string
     SESSION_SECRET=your-session-secret
     ```
   - Make sure `.env` is in your `.gitignore`.

4. **Run the server**
   ```sh
   node server.js
   ```

5. **Open your browser and visit:**
   [http://localhost:3050](http://localhost:3050)

---

## 🔎 How to Use

- 🩸 **Register as a Donor:** Share your details and availability to help others.
- 🆘 **Request Blood:** Fill out the patient form and submit a blood request.
- 🧭 **Find Blood:** Locate blood units near you using geolocation search.
- 📂 **Manage Profile:** View your dashboard, stats, and update your profile.
- 📰 **Explore Blog & Gallery:** Stay informed and inspired through donation stories.

---

## 🙌 Acknowledgements

- Built for educational purposes and to promote blood donation awareness.
- Inspired by real-world needs for more efficient blood request and donor management.

---

*Designed with ❤️ to help save lives — one drop at a time.*