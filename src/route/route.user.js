import express from "express";
import {
  renderHomePage,
  staffRegisterPage,
  loginPage,
  login,
  forgot,
  reset,
  forgotPassword,
  resetPassword,
  updateUser,
  renderUpdatePage,
  delete2,
  delete1,
  uploadFile,
} from "../controller/controller.js";
import upload from "../controller/multer.js";

const router = express.Router();

// ------------------ Render Pages ------------------ //
router.get("/", renderHomePage); 
router.get("/login", loginPage); 
router.get("/forgot-password", forgot);
router.get("/reset-password/:token", reset); 
router.get("/update-user/:email", renderUpdatePage); 
router.get("/delete-user/:email", delete2);

// Register and upload file together
router.post("/register", upload.single("image"), staffRegisterPage); 
router.post("/login", login); 
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password/:token", resetPassword); 
router.post("/update-user/:email", upload.single("image"), updateUser);
router.post("/delete-user/:email", delete1); 




export default router;
