const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();

const connectDB = require("./config/db");
require("./cron/expiryCron"); // Initialize cron jobs

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marriageDetailsAdminRoutes = require("./routes/marriageDetailsAdminRoutes");
const searchRoutes = require("./routes/searchRoutes");
const batchRoutes = require("./routes/batchRoutes");
const sharedProfileRoutes = require("./routes/sharedProfileRoutes");
const userInterestRoutes = require("./routes/userInterestRoutes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', // User Client App
    'http://localhost:5174', // Admin App
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Custom sanitization for Express 5 (Avoids req.query getter issue)
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  next();
});


connectDB();

app.get("/", (req, res) => {
  res.send("Matrimony Backend Running");
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", marriageDetailsAdminRoutes);
app.use("/admin", batchRoutes);
app.use("/search", searchRoutes);
app.use("/user", sharedProfileRoutes);
app.use("/user", userInterestRoutes);
app.use("/payment", require("./routes/paymentRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});