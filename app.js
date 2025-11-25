import "dotenv/config.js";
import createError from "http-errors";
import express, { json, urlencoded, static as static_ } from "express";
import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import indexRouter from "./routes/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(static_(join(__dirname, "public")));

app.use("/", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send(err.message);
});

const PORT = 3000;
app.listen(PORT);
