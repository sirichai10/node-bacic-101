import { Router } from "express";
import { getProfileData } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", getProfileData);


export default router;
