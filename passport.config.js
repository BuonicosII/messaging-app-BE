import "dotenv/config.js";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "./generated/prisma/client.ts";
import bcpkg from "bcryptjs";
const { compare } = bcpkg;
const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }
      const match = await compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Invalid username or password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: jwt_payload.sub,
        },
      });
      if (!user) {
        return done(null, false, { message: "Invalid token" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

export default passport;
