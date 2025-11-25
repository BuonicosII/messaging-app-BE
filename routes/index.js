import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res, next) => {
  const user = await prisma.user.findFirst();
  res.status(200).json(user);
});

export default router;
