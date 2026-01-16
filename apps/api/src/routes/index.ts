import express, { Router } from "express";
import { userRoute } from "./user/user.route";
import { authRoute } from "./auth/auth.route";
import { authMiddleware } from "../middleware";

const routes: Router = express.Router();

routes.use("/auth", authRoute);
routes.use("/user", authMiddleware, userRoute);

export default routes;
