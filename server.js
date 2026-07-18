const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/fees", require("./routes/fees"));
app.use("/api/results", require("./routes/results"));
app.use("/api/notices", require("./routes/notices"));
app.use("/api/timetable", require("./routes/timetable"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/visitors", require("./routes/visitors"));
app.use("/api/events", require("./routes/events"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/downloads", require("./routes/downloads"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/placements", require("./routes/placements"));
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/content", require("./routes/content"));

const publicPages = [
  "index", "about", "vc-message", "registrar-message", "vision-mission",
  "history", "leadership", "accreditation", "academics", "academic-calendar",
  "syllabus", "departments", "admissions", "ug-admissions", "pg-admissions",
  "phd-admissions", "fee-structure", "eligibility", "scholarships",
  "examination", "date-sheets", "admit-card", "results", "revaluation",
  "research", "publications", "research-centers", "phd-programmes",
  "library", "hostel", "sports", "health-center", "student-clubs",
  "campus-tour", "gallery", "notices", "tenders", "downloads",
  "contact", "feedback", "placement", "faculty-directory",
  "iqac", "naac", "nirf", "rti", "career", "alumni",
  "anti-ragging", "grievance", "women-cell", "sc-st-cell", "student-corner",
  "committees", "sitemap", "search", "404",
  "privacy-policy", "terms", "login",
  "dashboard", "attendance", "fees", "results-entry",
  "notices-erp", "timetable", "admin", "registration", "logout"
];

publicPages.forEach(function(page) {
  app.get("/" + page, function(req, res) {
    res.sendFile(path.join(__dirname, "public", page + ".html"));
  });
  app.get("/" + page + ".html", function(req, res) {
    res.sendFile(path.join(__dirname, "public", page + ".html"));
  });
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(function(req, res) {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", function() {
  console.log("University server running on port " + PORT);
});
