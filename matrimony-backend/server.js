const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

dotenv.config();

const connectDB = require("./config/db");
const { initEmailService } = require("./services/emailService");

// Initialize cron jobs
require("./cron/expiryCron");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marriageDetailsAdminRoutes = require("./routes/marriageDetailsAdminRoutes");
const searchRoutes = require("./routes/searchRoutes");
const batchRoutes = require("./routes/batchRoutes");
const sharedProfileRoutes = require("./routes/sharedProfileRoutes");
const userInterestRoutes = require("./routes/userInterestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ========================================
// TRUST PROXY (RENDER)
// ========================================

app.set("trust proxy", 1);

// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(
helmet({
crossOriginResourcePolicy: false,
})
);

// ========================================
// BODY PARSERS
// ========================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
// Production Frontend
"https://roots-and-rings-matrimony.vercel.app",

// Production Admin
"https://roots-and-rings-admin.vercel.app",

// Local Development
"http://localhost:5173",
"http://localhost:5174",
"http://localhost:3000",
];

// Add additional origins from ENV
if (process.env.ALLOWED_ORIGINS) {
process.env.ALLOWED_ORIGINS.split(",")
.map((origin) => origin.trim())
.forEach((origin) => {
if (origin && !allowedOrigins.includes(origin)) {
allowedOrigins.push(origin);
}
});
}

const corsOptions = {
origin: function (origin, callback) {
// Allow requests with no origin
// (Postman, mobile apps, curl, server-server)
if (!origin) {
return callback(null, true);
}
    // Allow exact origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow ALL Vercel preview deployments
    const isVercelPreview =
      origin.endsWith(".vercel.app") &&
      (
        origin.includes("roots-and-rings") ||
        origin.includes("rootsandrings")
      );

    if (isVercelPreview) {
      return callback(null, true);
    }

    console.error("CORS BLOCKED:", origin);

    return callback(
      new Error("CORS blocked for origin: " + origin)
    );
  },

credentials: true,

methods: [
"GET",
"POST",
"PUT",
"PATCH",
"DELETE",
"OPTIONS",
],

allowedHeaders: [
"Content-Type",
"Authorization",
"X-Requested-With",
"Accept",
"Origin",
],

exposedHeaders: [
"Content-Length",
"Content-Type",
],

optionsSuccessStatus: 200,
};

// IMPORTANT:
// CORS MUST COME BEFORE ROUTES
app.use(cors(corsOptions));


// ========================================
// SANITIZATION
// ========================================


// ========================================
// DATABASE CONNECTION
// ========================================

connectDB();
initEmailService().catch((error) => {
console.error("EMAIL_INIT_ERROR:", error.message);
if (error.message === "Email configuration missing") {
process.exit(1);
}
});

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
res.status(200).send("Matrimony Backend Running");
});

// ========================================
// ROUTES
// ========================================

app.use("/auth", authRoutes);

app.use("/profile", profileRoutes);

app.use("/admin", adminRoutes);

app.use("/admin", marriageDetailsAdminRoutes);

app.use("/admin", batchRoutes);

app.use("/search", searchRoutes);

app.use("/user", sharedProfileRoutes);

app.use("/user", userInterestRoutes);

app.use("/payment", paymentRoutes);

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
res.status(404).json({
success: false,
message: "Route not found",
});
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
console.error("SERVER ERROR:", err);

res.status(err.status || 500).json({
success: false,
message: err.message || "Internal Server Error",
});
});

// ========================================
// SERVER START
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
