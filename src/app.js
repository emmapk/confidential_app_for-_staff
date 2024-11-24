import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import routeUse from "../src/route/route.user.js";
import connectDB from "./db/db.user.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set the directory for EJS templates
app.set("view engine", "ejs");
app.set("views", "src/views");

// Static file serving (e.g., for public assets like CSS, JS)
app.use(express.static("public"));

// Routes
app.use(routeUse);

// Database connection and server start
(async () => {
  try {
    await connectDB();
    console.log("MongoDB connection successful");

    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
})();
