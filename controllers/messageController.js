import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import passport from "../passport-config.js";
import { PrismaClient } from "../generated/prisma/client.ts";
const prisma = new PrismaClient();

export const create_message_post = [
  passport.authenticate("jwt", { session: false }),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content required")
    .isString()
    .withMessage("Content must be a string")
    .escape(),
  body("conversation_id")
    .trim()
    .notEmpty()
    .withMessage("conversation_id required")
    .isString()
    .withMessage("conversation_id must be a string")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
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
    }
  }),
];

export const update_message_put = [
  passport.authenticate("jwt", { session: false }),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content required")
    .isString()
    .withMessage("Content must be a string")
    .escape(),
  body("message_id")
    .trim()
    .notEmpty()
    .withMessage("message_id requried")
    .isString()
    .withMessage("message_id must be a string")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        const oldMessage = await prisma.message.findUnique({
          where: {
            id: req.body.message_id,
          },
        });

        if (!oldMessage) {
          res.status(404).json({ msg: "Message not found" });
        } else if (oldMessage.userId !== req.user.id) {
          res.status(403).json({ msg: "User does not match message author" });
        } else if (oldMessage.type !== "text/plain") {
          res
            .status(500)
            .json({ msg: "Can't edit a message which is not type text/plain" });
        } else {
          const updatedMessage = await prisma.message.update({
            where: {
              id: req.body.message_id,
            },
            data: {
              content: req.body.content,
            },
          });
          res.status(200).json(updatedMessage);
        }
      } catch (err) {
        next(err);
      }
    }
  }),
];
