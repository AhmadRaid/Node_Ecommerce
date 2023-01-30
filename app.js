const express = require("express");
const app = express();
const router = express.Router();
require("dotenv").config();
var cookieParser = require("cookie-parser");
const userRoute = require("./route/user");
const authRoute = require("./route/auth");
const requestRoute = require("./route/request");
const productRoute = require("./route/product");
const categoryRoute = require("./route/category");
const tagsRoute = require("./route/tags");
const PORT = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const connectDB = require("./db/connect");
const AppError = require("./utils/AppError");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const { createServer } = require("http");
const { Server } = require("socket.io");
const globalErrorHandler = require("./controllers/errorController");
const { hasUncaughtExceptionCaptureCallback } = require("process");
const { AccessControl } = require("accesscontrol");

//for Sync error code
process.on("UncaughtException", (err) => {
  console.error(err.name, err.message);
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});

const limiter = rateLimit({
  max: 100, // maximum
  windowMs: 1 * 24 * 60 * 60 * 1000, // one hour
  message: "Too Many Requests from this IP , please try again in an hour",
});

app.use("/api", limiter);
app.use(cookieParser());

app.use(express.static("uploads"));

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

app.use(bodyParser.json());

global.__basedir = __dirname + "/";

// Development logging
if (process.env.NODE_ENV === "development") {
  // app.use(morgan('dev'));
}

let server;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    server = app.listen(PORT, (err, d) => {
      logger.info(`The Server Start ${PORT}...`);
    });

    // const io = require("socket.io")(server);
    // io.on("connection", function (socket) {
    // console.log("Made socket connection");
    // io.emit("hello" , 'the message emit1')

    // socket.on("hello", function (text_message) {
    //   console.log(text_message)
    //     io.emit('hello' , 'the message emit2')
    // });
  } catch (err) {
    console.log(err);
  }
};
start();

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/user", userRoute);

app.use("/api/v1/request", requestRoute);

app.use("/api/v1/product", productRoute);

app.use("/api/v1/category", categoryRoute);

app.use("/api/v1/tags", tagsRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
