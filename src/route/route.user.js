import express from "express";
import { renderHomePage, staffRegisterPage, loginPage, login } from "../controller/controller.js";

const router = express.Router();

router.get("/homePage", renderHomePage);

router.get("/register", staffRegisterPage);

router.post("/register", staffRegisterPage);


router.get("/login", loginPage)
router.post("/login", login)

export default router;
