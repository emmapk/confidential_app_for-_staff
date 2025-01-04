import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import routeUse from "../src/route/route.user.js";
import connectDB from "./db/db.user.js";

dotenv.config();

const app = express();


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(express.static("public"));

// Routes
app.use(routeUse);

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
