import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import passport from "../passport-config.js";
import { PrismaClient } from "../generated/prisma/client.ts";
const prisma = new PrismaClient();

export const create_conversation_one_to_one_post = [
  passport.authenticate("jwt", { session: false }),
  body("user_id")
    .notEmpty()
    .withMessage("user_id required")
    .isString()
    .withMessage("user_id must be a string")
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        const oldConversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              {
                owners: {
                  every: {
                    id: {
                      in: [req.user.id, req.body.user_id],
                    },
                  },
                },
              },
            ],
          },
        });

        if (oldConversation) {
          res.status(200).json(oldConversation);
        } else {
          const conversation = await prisma.conversation.create({
            data: {
              owners: {
                connect: [{ id: req.user.id }, { id: req.body.user_id }],
              },
            },
          });
          res.status(200).json(conversation);
        }
      } catch (err) {
        return next(err);
      }
    }
  }),
];

export const create_conversation_one_to_many_post = [
  passport.authenticate("jwt", { session: false }),
  body("user_id")
    .isArray({ min: 1 })
    .withMessage("user_id must be an array with at least one user_id"),
  body("user_id.*")
    .isString()
    .withMessage("user_id must be a string")
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        req.body.user_id.push(req.user.id);

        const conversation = await prisma.conversation.create({
          data: {
            owners: {
              connect: req.body.user_id.map((element) => {
                return { id: element };
              }),
            },
          },
        });
        res.status(200).json(conversation);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

export const get_user_conversations = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    try {
      const conversation = await prisma.conversation.findMany({
        where: {
          AND: [
            {
              owners: {
                some: {
                  id: req.user.id,
                },
              },
            },
          ],
        },
        include: {
          owners: true,
        },
      });
      res.status(200).json(conversation);
    } catch (err) {
      return next(err);
    }
  }),
];

export const get_conversation_with_messages = [
  passport.authenticate("jwt", { session: false }),
  body("id")
    .notEmpty()
    .withMessage("conversation_id required")
    .isString()
    .withMessage("Id must be a string")
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {
    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: {
            id: req.body.conversation_id,
          },
          include: {
            messages: true,
          },
        });
        res.status(200).json(conversation);
      } catch (err) {
        return next(err);
      }
    }
  }),
];
