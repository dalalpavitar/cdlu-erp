# Chaudhary Devi Lal University (CDLU) - Official Website

## Project Overview
A fully responsive multi-page static website for Chaudhary Devi Lal University, Sirsa (Haryana), featuring an Indian tricolor theme (Saffron-Navy-Green). Includes a student registration system with Firebase real-time database integration.

## Live Website
**URL:** https://dalalpavitar.github.io/cdlu-university/

---

## Table of Contents
1. [Architecture](#architecture)
2. [Pages & Features](#pages--features)
3. [Theme & Design](#theme--design)
4. [Registration System](#registration-system)
5. [Admin Panel](#admin-panel)
6. [Database (Firebase)](#database-firebase)
7. [File Structure](#file-structure)
8. [How to Update Content](#how-to-update-content)
9. [Technologies Used](#technologies-used)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  HTML    │  │   CSS    │  │   JavaScript      │   │
│  │  (Pages) │  │ (Styles) │  │ (Logic + Firebase)│   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │             │                 │              │
└───────┴─────────────┴─────────────────┴──────────────┘
        │                              │
        ▼                              ▼
┌───────────────┐          ┌─────────────────────┐
│  GitHub Pages  │          │   Firebase Firestore  │
│  (Static Host) │          │  (Real-time Database) │
│  ┌───────────┐ │          │  ┌─────────────────┐ │
│  │ HTML/CSS  │ │          │  │ registrations   │ │
│  │ JS/Images │ │          │  │ collection      │ │
│  └───────────┘ │          │  └─────────────────┘ │
└───────────────┘          └─────────────────────┘
```

**How data flows:**
1. User opens website → HTML+CSS+JS loaded from GitHub Pages
2. Student fills registration form → Data sent to Firebase Firestore
3. Admin opens admin panel → Firebase sends real-time updates
4. No backend server needed — everything works client-side

---

## Pages & Features

### 1. Home Page (index.html)
- **Hero Section:** CDLU main gate photo with navy gradient overlay. University name, motto, and CTA buttons ("Apply for Admission", "Explore CDLU")
- **Stats Counter:** 42,000+ Students, 24 Departments, 62+ Colleges, 213 Acres (animated counter on scroll)
- **Welcome Section:** 6 feature cards (Quality Education, Diverse Programs, Sprawling Campus, Research & Innovation, Campus Facilities, UGC Recognized)
- **Latest News:** 4 news cards with university updates
- **Upcoming Events:** Event list with dates (Admission Counselling, National Seminar, Cultural Fest, Session Commencement)

### 2. About Page (about.html)
- **Page Banner:** Navy gradient banner with page title
- **About Section:** University history, establishment details (2003), location
- **Vision & Mission:** Educational philosophy and objectives
- **Leadership Team:** VC Prof. Vijay Kumar, Registrar, Controller of Exams with profile cards

### 3. Academics Page (academics.html)
- **Faculties:** 8 faculties listed with cards (Life Sciences, Humanities, Commerce & Management, Physical Sciences, Education, Law, Social Sciences, Engineering & Technology)
- **Departments:** 24 departments listed in grid
- **Programmes:** Tab-based filtering by faculty. Each programme shows duration, type, and details

### 4. Admissions Page (admissions.html)
- **Admission Steps:** 3-step process (Apply Online, Document Verification, Fee Payment)
- **Fee Structure:** Table with course-wise fees (B.Sc ₹16,500, MBA ₹44,500, B.Tech ₹1.6 Lakh, etc.)
- **Scholarships:** 6 scholarship schemes listed
- **Requirements:** Eligibility criteria checklist

### 5. Registration Page (registration.html)
- **Student Registration Form:** 12 fields (Name, Father's Name, DOB, Gender, Category, Phone, Email, Programme, Qualification, Percentage, Address)
- **Validation:** Required fields, phone number validation
- **Success Screen:** Shows Registration ID after submission
- **Dual Storage:** Saves to both localStorage (offline backup) and Firebase (cloud)

### 6. Contact Page (contact.html)
- **Contact Info:** Address, Phone, Email, Office Hours
- **Contact Form:** Name, Email, Subject, Message with success feedback
- **Map Placeholder:** University location indicator

### 7. Admin Panel (admin.html)
- **Password Protected:** Login with password (default: cdlu@2026)
- **Stats Dashboard:** Total registrations, Today's registrations, Total students
- **Search:** Filter by name, phone, or registration ID
- **Exports:** Download CSV, Download JSON, Print Report
- **Real-time Table:** Auto-updates when new registrations come in
- **Data Management:** Clear all data option

---

## Theme & Design

### Color Scheme (Indian Tricolor)
| Color | Code | Usage |
|-------|------|-------|
| Saffron | #FF9933 | Primary buttons, hover effects, accent borders |
| Navy | #1B2A4A | Header, footer, banners, headings |
| Green | #138808 | Success states, checkmarks |
| White | #FFFFFF | Cards, content backgrounds |

### Typography
- **Font:** Segoe UI (system font stack)
- **Hierarchy:** h1 (2.6rem) → h2 (1.8rem) → h3 (1.1rem) → body (0.92rem)
- **Motto:** Shraddhavan Labhate Gyanam (Sanskrit)

### Responsive Design
| Breakpoint | Target |
|-----------|--------|
| > 992px | Desktop (3-column layouts) |
| 768-992px | Tablet (2-column layouts) |
| < 768px | Mobile (single column, hamburger menu) |
| < 480px | Small mobile (stacked stats) |

### Animations
- Hero background glow (CSS keyframes)
- Card hover lift effect (translateY)
- Stats counter (JS interval-based)
- Nav underline hover animation
- Smooth scroll to top
- Fade-in mobile menu

---

## Registration System

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | text | Yes | - |
| Father's Name | text | Yes | - |
| Date of Birth | date | Yes | Browser date picker |
| Gender | select | Yes | Male/Female/Other |
| Category | select | Yes | General/OBC/SC/ST/EWS |
| Mobile | tel | Yes | 10-digit pattern |
| Email | email | No | Email format |
| Programme | select | Yes | 14 options across UG/PG/Other |
| Qualification | select | Yes | 10th/12th/Graduate/PG |
| Percentage | text | No | - |
| Address | textarea | No | - |

### Registration ID Format
```
CDLU-{timestamp}-{random4}
Example: CDLU-1687945238417-A3F8
```

### Data Storage
```
1. localStorage key: "cdluRegistrations" (array of objects)
2. Firebase collection: "registrations" (auto-generated document IDs)
```

---

## Admin Panel

### Authentication
- **Password:** cdlu@2026 (configurable in admin.js)
- **Session:** Stored in localStorage (persists until logout)
- **No server-side auth** (static site limitation)

### Features
1. **Dashboard Stats:** 
   - Total registrations count
   - Today's registrations count
   - Total students (same as total count)

2. **Search Bar:** Filters table in real-time by:
   - Student name
   - Phone number
   - Registration ID
   - Father's name

3. **Export Options:**
   - **CSV:** Opens in Excel/Google Sheets
   - **JSON:** Raw data format for developers
   - **Print:** Browser print dialog with formatted layout

4. **Data Table Columns:**
   #, Reg ID, Name, Father's Name, DOB, Gender, Category, Phone, Email, Programme, Qualification, Percentage, Registered On

---

## Database (Firebase)

### Configuration
```javascript
firebaseConfig = {
  apiKey: "AIzaSyBrXRJyJuqvQ5ikAOwoBthIojJSZ3KwyKY",
  authDomain: "cdlu-university.firebaseapp.com",
  projectId: "cdlu-university",
  storageBucket: "cdlu-university.firebasestorage.app",
  messagingSenderId: "336912868141",
  appId: "1:336912868141:web:4c8fa6e630bb44c27229a4"
}
```

### Firestore Collection Structure
```
registrations/ (collection)
  ├── {auto-doc-id} (document)
  │   ├── id: "CDLU-1687945238417-A3F8"
  │   ├── name: "Rahul Kumar"
  │   ├── fatherName: "Suresh Kumar"
  │   ├── dob: "2005-06-15"
  │   ├── gender: "Male"
  │   ├── category: "General"
  │   ├── phone: "9876543210"
  │   ├── email: "rahul@email.com"
  │   ├── programme: "BCA"
  │   ├── qualification: "12th"
  │   ├── percentage: "85%"
  │   ├── address: "Sirsa, Haryana"
  │   └── registeredOn: "2026-06-27T10:30:00.000Z"
```

### Real-time Listener
```javascript
db.collection('registrations')
  .orderBy('registeredOn', 'desc')
  .onSnapshot(function(snapshot) {
    // Auto-updates table on any change
  });
```

### Security Rules (Test Mode)
```
// Currently set to test mode (open access)
// Recommended to update for production:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;  // Anyone can read
      allow write: if request.resource.data.name != null;  // Requires name field
    }
  }
}
```

---

## File Structure

```
C:\Users\...\Desktop\university\
│
├── index.html              # Home page
├── about.html              # About CDLU  
├── academics.html          # Academics, faculties, departments
├── admissions.html         # Admissions, fees, scholarships
├── registration.html       # Student registration form
├── contact.html            # Contact information
├── admin.html              # Admin dashboard (password protected)
├── README.md               # This documentation file
│
├── css/
│   └── style.css           # All styles (1008+ lines)
│
├── js/
│   ├── script.js           # Common JS (nav, counter, tabs, form)
│   ├── registration.js     # Registration form handler
│   ├── admin.js            # Admin panel logic
│   └── firebase-config.js  # Firebase initialization
│
└── images/
    ├── cdlu-logo.png        # CDLU official logo
    └── hero-bg.jpg          # CDLU main gate photo
```

---

## How to Update Content

### Editing Text (e.g., News, Events)
1. Open the relevant `.html` file
2. Find the section to edit (look for article/news-card/event-item)
3. Change the text between `<h4>`, `<p>`, or `<div>` tags
4. Save the file

### Adding a New Page
1. Copy an existing `.html` file as template
2. Change the `<title>` and page content
3. Add the page link in `<nav>` on ALL pages
4. Add the page link in `<footer>` on ALL pages

### Changing Theme Colors
Edit `css/style.css` → `:root` section:
```css
--saffron: #FF9933;   /* Orange */
--navy: #1B2A4A;      /* Dark blue */
--green: #138808;     /* Green */
```

### Changing Admin Password
Edit `js/admin.js` → Line 1:
```javascript
var ADMIN_PASS = 'cdlu@2026';
```

### Updating the Website (Deploy)
Currently deployed via GitHub API. To update:
1. Edit files locally
2. Contact developer to re-run deployment script
3. Or use `git push` if Git is configured

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure |
| CSS3 | Styling, animations, responsive design |
| JavaScript (Vanilla) | Interactive features, form handling |
| Firebase Firestore | Cloud database, real-time sync |
| GitHub Pages | Free web hosting |
| GitHub API | Automated deployment |

---

## Contact

**Developer:** CDLU Website Project  
**GitHub:** https://github.com/dalalpavitar/cdlu-university-  
**Live Site:** https://dalalpavitar.github.io/cdlu-university/  
**Admin Panel:** https://dalalpavitar.github.io/cdlu-university/admin.html  
**Admin Password:** cdlu@2026  
**Firebase Console:** https://console.firebase.google.com/project/cdlu-university/overview

---

*Document generated on June 27, 2026*
