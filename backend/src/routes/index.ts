import { Router } from "express";
import healthRouter from "./health.routes.js";
import dashboardRouter from "./dashboard.routes.js";
// import profileRouter from "./profile.routes.js";
import productRouter from "./product.routes.js";
import authRouter from "./auth.routes.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);

// Protected routes
router.use("/dashboard", authenticateJWT, dashboardRouter);
// router.use("/profile", authenticateJWT, profileRouter);
router.use("/products", authenticateJWT, productRouter);

export default router;
