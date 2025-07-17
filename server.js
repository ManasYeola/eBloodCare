const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3050;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}))
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.once('open',()=>{
    console.log("mongodb connection sucessfull")
})

const userSchema = new mongoose.Schema({
    patientFirstName:String,
    patientLastName:String,
    attendeeFirstName:String,
    attendeeLastName:String,
    attendeeMobile:Number,
    bloodGroup:String,
    requestType:String,
    quantity:Number,
    requiredDate:String,
    address:String,
    emergency:String,
    terms:String,
    type: String // 'donor' or 'request'
})

const Users = mongoose.model("data",userSchema)

// Update user schema for role and activity
const userAuthSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    profilePic: String,
    role: { type: String, default: 'user' }, // 'user', 'donor', 'admin'
    lastDonation: Date,
    requests: [{
        date: Date,
        bloodGroup: String,
        quantity: Number
    }],
    donations: [{
        date: Date,
        bloodGroup: String,
        quantity: Number
    }]
});
const AuthUser = mongoose.model('authuser', userAuthSchema);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Profile picture upload setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'profilepics'));
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, req.session.userId + '.' + ext);
    }
});
const upload = multer({ storage });

app.use('/profilepics', express.static(path.join(__dirname, 'profilepics')));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'Blood.HTML'));
})

app.post('/post',async(req,res)=>{
    try {
        const {patientFirstName , patientLastName , attendeeFirstName , attendeeLastName ,attendeeMobile,
            bloodGroup,requestType,quantity,requiredDate,address} = req.body;
        // Normalize checkboxes
        const emergency = req.body.emergency ? "Yes" : "No";
        const terms = req.body.terms ? "Yes" : "No";
        const user = new Users({
            patientFirstName,
            patientLastName,
            attendeeFirstName,
            attendeeLastName,
            attendeeMobile,
            bloodGroup,
            requestType,
            quantity,
            requiredDate,
            address,
            emergency,
            terms,
            type: 'request'
        });
        await user.save();
        console.log(user);
        res.send("Form submission successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error submitting form");
    }
});

app.post('/donor', async (req, res) => {
    try {
    const {patientFirstName , patientLastName , attendeeFirstName , attendeeLastName ,attendeeMobile,
            bloodGroup,requestType,quantity,requiredDate,address} = req.body;
        // Normalize checkboxes
        const emergency = req.body.emergency ? "Yes" : "No";
        const terms = req.body.terms ? "Yes" : "No";
        const user = new Users({
            patientFirstName,
            patientLastName,
            attendeeFirstName,
            attendeeLastName,
            attendeeMobile,
            bloodGroup,
            requestType,
            quantity,
            requiredDate,
            address,
            emergency,
            terms,
            type: 'donor'
        });
        await user.save();
        console.log(user);
        res.send("Donor registration successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error submitting donor registration");
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).send('All fields are required.');
        }
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }
        const existing = await AuthUser.findOne({ email });
        if (existing) {
            return res.status(400).send('Email already registered.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new AuthUser({ name, email, password: hashedPassword });
        await user.save();
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userPic = null;
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Error signing up.');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send('All fields are required.');
        }
        const user = await AuthUser.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Invalid email or password.');
        }
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userPic = user.profilePic || null;
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Error logging in.');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/Login.html');
    }
    const user = await AuthUser.findById(req.session.userId);
    let profilePic = user && user.profilePic ? `/profilepics/${user.profilePic}` : './images/BLOOD.png';    
    // Personalized greeting
    const hour = new Date().getHours();
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    // Stats
    const totalDonations = user.donations ? user.donations.length : 0;
    const totalRequests = user.requests ? user.requests.length : 0;
    const lastDonation = user.lastDonation ? user.lastDonation.toDateString() : 'N/A';
    // Recent activity
    const recentRequests = (user.requests || []).slice(-3).reverse();
    const recentDonations = (user.donations || []).slice(-3).reverse();
    // Render dashboard with user info (inject via template or simple string replace)
    let html = await fs.promises.readFile(path.join(__dirname, 'views', 'Dashboard.html'), 'utf8');
    html = html.replace('{{USER_NAME}}', user ? user.name : '')
               .replace('{{USER_EMAIL}}', user ? user.email : '')
               .replace('{{USER_PIC}}', profilePic)
               .replace('{{USER_ROLE}}', user ? user.role : 'user')
               .replace('{{GREETING}}', greeting)
               .replace('{{TOTAL_DONATIONS}}', totalDonations)
               .replace('{{TOTAL_REQUESTS}}', totalRequests)
               .replace('{{LAST_DONATION}}', lastDonation)
               .replace('{{RECENT_REQUESTS}}', recentRequests.map(r => `<li>${r.date ? new Date(r.date).toLocaleDateString() : ''} - ${r.bloodGroup} (${r.quantity}L)</li>`).join('') || '<li>No recent requests</li>')
               .replace('{{RECENT_DONATIONS}}', recentDonations.map(d => `<li>${d.date ? new Date(d.date).toLocaleDateString() : ''} - ${d.bloodGroup} (${d.quantity}L)</li>`).join('') || '<li>No recent donations</li>');
    res.send(html);
});

// Profile editing
app.post('/update-profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/Login.html');
    const { name, email, password } = req.body;
    const update = { name, email };
    if (password) {
        update.password = await bcrypt.hash(password, 10);
    }
    await AuthUser.findByIdAndUpdate(req.session.userId, update);
    req.session.userName = name;
    req.session.userEmail = email;
    res.redirect('/dashboard');
});

app.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    if (!req.session.userId) return res.redirect('/Login.html');
    const ext = req.file.originalname.split('.').pop();
    const filename = req.session.userId + '.' + ext;
    await AuthUser.findByIdAndUpdate(req.session.userId, { profilePic: filename });
    req.session.userPic = filename;
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/Login.html');
    });
});

// Auth middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/Login.html');
    }
    next();
}

// Protect static HTML pages (except Home, Login, Signup)
app.get(['/Form.html', '/FormD.html', '/BLOG.html', '/WTDB.html', '/Gallery.html', '/RegisterD.html', '/RegisterR.html', '/dashboard'], requireAuth, (req, res, next) => {
    next();
});

// Explicit route for Gallery.html to ensure it is served correctly
app.get('/Gallery.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Gallery.html'));
});

// Serve Blood.HTML with login state injection
app.get('/Blood.HTML', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'Blood.HTML'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error loading page');
        // Inject a JS variable for login state
        const isLoggedIn = !!req.session.userId;
        const injected = data.replace('</head>', `<script>window.IS_LOGGED_IN = ${isLoggedIn};</script>\n</head>`);
        res.send(injected);
    });
});

// Protect donors and requests pages
app.get('/donors', requireAuth, async (req, res, next) => {
    try {
        const donors = await Users.find({type: 'donor'});
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registered Donors - PICTOBLOOD</title>
    <link rel="stylesheet" href="modern.css">
    <style>
        nav { position: sticky; top: 0; width: 100vw; left: 0; right: 0; z-index: 100; border-radius: 0; margin-bottom: 0; }
        .donor-container { max-width: 1200px; margin: 2em auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 2em; }
        th, td { padding: 0.7em 1em; text-align: left; }
        th { background: #b3001b; color: #fff; }
        tr:nth-child(even) { background: #fff6f6; }
        tr:nth-child(odd) { background: #f9f9f9; }
        @media (max-width: 900px) { th, td { font-size: 0.95em; padding: 0.5em 0.5em; } }
    </style>
</head>
<body>
    <nav>
        <img src="./images/BLOOD.png" alt="PICTOBLOOD Logo" style="height:40px;vertical-align:middle;margin-right:1em;">
        <a href="Blood.HTML">Home</a>
        <a href="BLOG.html">Blog</a>
        <a href="Gallery.html">Gallery</a>
        <a href="WTDB.html">Why Donate?</a>
        <a href="/donors">Donors</a>
        <a href="/requests">Requests</a>
        <a href="/dashboard" style="margin-left:auto;">Dashboard</a>
        <a href="/logout" style="margin-left:0.5em;">Logout</a>
    </nav>
    <div class="donor-container">
        <h1>Registered Donors</h1>
        <table>
            <tr><th>Patient First Name</th><th>Patient Last Name</th><th>Attendee First Name</th><th>Attendee Last Name</th><th>Mobile</th><th>Blood Group</th><th>Request Type</th><th>Quantity</th><th>Date</th><th>Address</th><th>Emergency</th></tr>
            ${donors.map(donor => `<tr><td>${donor.patientFirstName}</td><td>${donor.patientLastName}</td><td>${donor.attendeeFirstName}</td><td>${donor.attendeeLastName}</td><td>${donor.attendeeMobile}</td><td>${donor.bloodGroup}</td><td>${donor.requestType}</td><td>${donor.quantity}</td><td>${donor.requiredDate}</td><td>${donor.address}</td><td>${donor.emergency}</td></tr>`).join('')}
        </table>
    </div>
    <footer style="text-align:center; margin:2em 0; color:#b3001b; font-size:1em;">&copy; 2024 PICTOBLOOD. All rights reserved.</footer>
</body>
</html>`;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error fetching donors');
    }
});

app.get('/requests', requireAuth, async (req, res, next) => {
    try {
        const requests = await Users.find({type: 'request'});
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blood Requests - PICTOBLOOD</title>
    <link rel="stylesheet" href="modern.css">
    <style>
        nav { position: sticky; top: 0; width: 100vw; left: 0; right: 0; z-index: 100; border-radius: 0; margin-bottom: 0; }
        .request-container { max-width: 1200px; margin: 2em auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 2em; }
        th, td { padding: 0.7em 1em; text-align: left; }
        th { background: #b3001b; color: #fff; }
        tr:nth-child(even) { background: #fff6f6; }
        tr:nth-child(odd) { background: #f9f9f9; }
        @media (max-width: 900px) { th, td { font-size: 0.95em; padding: 0.5em 0.5em; } }
    </style>
</head>
<body>
    <nav>
        <img src="./images/BLOOD.png" alt="PICTOBLOOD Logo" style="height:40px;vertical-align:middle;margin-right:1em;">
        <a href="Blood.HTML">Home</a>
        <a href="BLOG.html">Blog</a>
        <a href="Gallery.html">Gallery</a>
        <a href="WTDB.html">Why Donate?</a>
        <a href="/donors">Donors</a>
        <a href="/requests">Requests</a>
        <a href="/dashboard" style="margin-left:auto;">Dashboard</a>
        <a href="/logout" style="margin-left:0.5em;">Logout</a>
    </nav>
    <div class="request-container">
        <h1>Blood Requests</h1>
        <table>
            <tr><th>Patient First Name</th><th>Patient Last Name</th><th>Attendee First Name</th><th>Attendee Last Name</th><th>Mobile</th><th>Blood Group</th><th>Request Type</th><th>Quantity</th><th>Date</th><th>Address</th><th>Emergency</th></tr>
            ${requests.map(request => `<tr><td>${request.patientFirstName}</td><td>${request.patientLastName}</td><td>${request.attendeeFirstName}</td><td>${request.attendeeLastName}</td><td>${request.attendeeMobile}</td><td>${request.bloodGroup}</td><td>${request.requestType}</td><td>${request.quantity}</td><td>${request.requiredDate}</td><td>${request.address}</td><td>${request.emergency}</td></tr>`).join('')}
        </table>
    </div>
    <footer style="text-align:center; margin:2em 0; color:#b3001b; font-size:1em;">&copy; 2024 PICTOBLOOD. All rights reserved.</footer>
</body>
</html>`;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error fetching requests');
    }
});

// Hospital model
const hospitalSchema = new mongoose.Schema({
    name: String,
    address: String,
    latitude: Number,
    longitude: Number,
    bloodStock: {
        A_pos: Number,
        A_neg: Number,
        B_pos: Number,
        B_neg: Number,
        AB_pos: Number,
        AB_neg: Number,
        O_pos: Number,
        O_neg: Number
    }
});
const Hospital = mongoose.model('hospital', hospitalSchema);

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Find nearest hospital with required blood
app.post('/find-blood', async (req, res) => {
    const { bloodGroup, latitude, longitude } = req.body;
    if (!bloodGroup || latitude == null || longitude == null) {
        return res.status(400).send('Missing required fields');
    }
    const stockKey = bloodGroup.replace('+', '_pos').replace('-', '_neg');
    const hospitals = await Hospital.find({ [`bloodStock.${stockKey}`]: { $gt: 0 } });
    const hospitalsWithDistance = hospitals.map(h => ({
        ...h.toObject(),
        distance: getDistance(Number(latitude), Number(longitude), h.latitude, h.longitude)
    }));
    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(hospitalsWithDistance.slice(0, 5));
});

// Route to insert sample hospital data
app.get('/add-sample-hospitals', async (req, res) => {
    const sampleHospitals = [
        {
            name: 'City Hospital',
            address: '123 Main St, Pune',
            latitude: 18.5204,
            longitude: 73.8567,
            bloodStock: { A_pos: 5, A_neg: 2, B_pos: 3, B_neg: 1, AB_pos: 2, AB_neg: 0, O_pos: 6, O_neg: 1 }
        },
        {
            name: 'Red Cross Clinic',
            address: '456 Red Cross Rd, Pune',
            latitude: 18.5310,
            longitude: 73.8446,
            bloodStock: { A_pos: 2, A_neg: 1, B_pos: 0, B_neg: 2, AB_pos: 1, AB_neg: 1, O_pos: 4, O_neg: 0 }
        },
        {
            name: 'Lifeline Hospital',
            address: '789 Lifeline Ave, Pune',
            latitude: 18.5100,
            longitude: 73.8500,
            bloodStock: { A_pos: 0, A_neg: 0, B_pos: 2, B_neg: 1, AB_pos: 0, AB_neg: 0, O_pos: 3, O_neg: 2 }
        }
    ];
    await Hospital.deleteMany({});
    await Hospital.insertMany(sampleHospitals);
    res.send('Sample hospitals inserted!');
});

// --- DASHBOARD DATA API ---
app.get('/api/dashboard-data', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Eligibility: can donate every 90 days (approx 3 months)
    let daysLeft = null;
    let eligible = true;
    let notifications = [];
    if (user.lastDonation) {
        const last = new Date(user.lastDonation);
        const now = new Date();
        const diff = Math.ceil((now - last) / (1000 * 60 * 60 * 24));
        daysLeft = 90 - diff;
        if (daysLeft > 0) {
            eligible = false;
            notifications.push({ type: 'info', message: `You can donate again in ${daysLeft} days.` });
        } else {
            daysLeft = 0;
            eligible = true;
            notifications.push({ type: 'success', message: 'You are eligible to donate blood again!' });
        }
    } else {
        notifications.push({ type: 'info', message: 'Donate blood for the first time and save lives!' });
    }

    // Sample recommendations (replace with real data as needed)
    const recommendations = [
        { title: 'Blood Donation Camp at City Hospital', date: '2024-06-10', location: 'City Hospital, Main Road' },
        { title: 'Community Blood Drive', date: '2024-06-18', location: 'Community Center' }
    ];

    res.json({
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic ? `/profilepics/${user.profilePic}` : 'BLOOD.png',
        totalDonations: user.donations ? user.donations.length : 0,
        totalRequests: user.requests ? user.requests.length : 0,
        lastDonation: user.lastDonation,
        recentRequests: (user.requests || []).slice(-3).reverse(),
        recentDonations: (user.donations || []).slice(-3).reverse(),
        eligible,
        daysLeft,
        recommendations,
        notifications
    });
});

// --- SIGNUP ROUTE (no email sent) ---
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).send('All fields are required.');
        }
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }
        const existing = await AuthUser.findOne({ email });
        if (existing) {
            return res.status(400).send('Email already registered.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new AuthUser({ name, email, password: hashedPassword });
    await user.save();
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userPic = null;
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Error signing up.');
    }
});

app.get('/Login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Login.html'));
});
app.get('/Signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Signup.html'));
});
app.get('/Form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Form.html'));
});
app.get('/FormD.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'FormD.html'));
});
app.get('/Home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Home.html'));
});
app.get('/Dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Dashboard.html'));
});
app.get('/Gallery.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Gallery.html'));
});
app.get('/RegisterR.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'RegisterR.html'));
});
app.get('/RegisterD.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'RegisterD.html'));
});
app.get('/WTDB.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'WTDB.html'));
});
app.get('/Blood.HTML', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Blood.HTML'));
});
app.get('/BLOG.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'BLOG.html'));
});
app.get('/FindBlood.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'FindBlood.html'));
});

app.listen(port , (req,res)=>{
    console.log(`server is on port ${port}`);
})