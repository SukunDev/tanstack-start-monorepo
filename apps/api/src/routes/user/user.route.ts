import express, { Router } from "express";
import { userController } from "@/controllers";
import { PermissionMiddleware } from "@/middleware";

const userRoute: Router = express.Router();

userRoute.get("/", PermissionMiddleware("read_users"), userController.getUser);

export { userRoute };
