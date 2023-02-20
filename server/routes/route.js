import express from "express";
import { verifyUser, register, login, getUser, updateUser, generateOTP, verifyOTP, createResetSession, resetPassword } from "../controllers/appController.js"
import Auth, { localVariables } from "../middlewares/auth.js";
import { registerMail } from "../controllers/mailer.js";

const router = express.Router();

router.post("/register", register);
router.post("/registerMail", registerMail);
router.post("/authenticate", verifyUser, (req, res)=>res.end());
router.post("/login",verifyUser,login);

router.get("/user/:username",getUser);
router.get("/generateOTP",verifyUser,localVariables,generateOTP);
router.get("/verifyOTP",verifyUser,verifyOTP);
router.get("/createResetSession",createResetSession);

router.put("/updateUser",Auth,updateUser);
router.put("/resetPassword",verifyUser,resetPassword);

export default router;