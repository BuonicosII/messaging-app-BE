import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import passport from "../passport-config.js";
import { PrismaClient } from "../generated/prisma/client.ts";
const prisma = new PrismaClient();

export const create_message_post = [
  passport.authenticate("jwt", { session: false }),
  body("content")
    .not()
    .isEmpty()
    .withMessage("Content required")
    .isString()
    .withMessage("Content must be a string"),
  body("conversation_id")
    .isEmpty()
    .withMessage("conversation_id required")
    .isString()
    .withMessage("conversation_id must be a string"),
  asyncHandler(async (req, res, next) => {
    try {
      const message = await prisma.message.create({
        data: {
          timeStamp: new Date(),
          content: req.body.content,
          type: "text/plain",
          user: {
            connect: {
              id: req.user.id,
            },
          },
          conversation: {
            connect: {
              id: req.body.conversation_id,
            },
          },
        },
      });
      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }),
];
