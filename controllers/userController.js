import { body, validationResult, check } from "express-validator";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import passport from "../passport.config.js";
import upload from "../multer.config.js";
import { Blob } from "buffer";
import { fileTypeFromBuffer } from "file-type";
import { issueJWT } from "../jwt-config.js";
import { PrismaClient } from "../generated/prisma/client.ts";
const prisma = new PrismaClient();

const supportedMimetypes = ["image/jpeg", "image/png", "image/gif"];

export const sign_up_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Required username"),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Required password"),
  body("passwordConfirm")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords don't match"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        } else {
          try {
            const user = await prisma.user.create({
              data: {
                username: req.body.username,
                password: hashedPassword,
              },
            });
            res.status(200).json(user);
          } catch (err) {
            return next(err);
          }
        }
      });
    }
  }),
];

export const get_user = [
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  },
];

export function login_post(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json(info.message);
      return;
    }
    const tokenObject = issueJWT(user);
    res.status(200).json({
      success: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
    });
    return;
  })(req, res, next);
}

export const update_username = [
  passport.authenticate("jwt", { session: false }),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Required username"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        const updatedUsername = await prisma.user.update({
          where: {
            id: req.user.id,
          },
          data: {
            username: req.body.username,
          },
        });
        res.status(200).json(updatedUsername);
      } catch (err) {
        next(err);
      }
    }
  }),
];

export const update_avatar = [
  passport.authenticate("jwt", { session: false }),
  upload.single("files"),
  check("files")
    .custom((value, { req }) => {
      if (!req.file) {
        return false;
      } else {
        return true;
      }
    })
    .withMessage("You must select a file"),
  check("files")
    .custom(async (value, { req }) => {
      const filetype = await fileTypeFromBuffer(req.file.buffer);
      return supportedMimetypes.includes(filetype.mime);
    })
    .withMessage("Please upload a supported file format: (jpg, png, gif)"),
  check("files")
    .custom((value, { req }) => {
      return req.file.size <= 1048576;
    })
    .withMessage("File too big: stay below the 10Mb limit"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json(errors.array());
    } else {
      try {
        const form = new FormData();
        form.append(
          "files",
          new Blob([req.file.buffer], { type: req.file.mimetype }),
          req.file.originalname,
        );
        form.append("folder", "products");

        const res_openinary = await fetch("https://cdn.openinary.dev/upload", {
          method: "POST",
          headers: { "x-api-key": process.env.OPENINARY_API_KEY },
          body: form,
        });

        const data = await res_openinary.json();

        const updatedAvatar = await prisma.user.update({
          where: {
            id: req.user.id,
          },
          data: {
            avatar:
              "https://cdn.openinary.dev" +
              data.files[0].url.replace("/t/", "/t/w_400,h_400,c_fill/"),
          },
        });

        res.status(200).json(updatedAvatar);
      } catch (err) {
        next(err);
      }
    }
  }),
];
