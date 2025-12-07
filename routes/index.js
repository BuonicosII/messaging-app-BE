import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
import {
  get_user,
  login_post,
  sign_up_post,
} from "../controllers/userController.js";
const prisma = new PrismaClient();

const router = Router();

router.get("/users/user", get_user);
router.post("/users/signup", sign_up_post);
router.post("/users/login", login_post);

export default router;
