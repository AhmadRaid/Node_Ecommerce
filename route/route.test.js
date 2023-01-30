const request = require("supertest");
const express = require("express");
const app = express();
const router = express.Router();
require("dotenv").config();
var cookieParser = require("cookie-parser");
const userRoute = require("./user");
const Request = require("../models/Request");
const authRoute = require("./auth");
const requestRoute = require("./request");
const bodyParser = require("body-parser");


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

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/user", userRoute);

app.use("/api/v1/request", requestRoute);

app.post('/request', (req,res) => {
  let doc =  Request.create(req.body);
   res.status(201).json({
     status: "success",
     data: doc,
   });
})

app.get('/test_login', (req,res) => {
   res.status(200).json({
     status: "success",
   });
})

describe("Test GET /Request", () => {
  test("its should respond with 200 success", async () => {
    const response = await request(app)
      .get("/test_login")
      .expect(200);
  });
});

describe("Test POST /Request", () => {
  let data = {
    name: "Request1",
    description: "Solve Exam1",
    user: "636a434049961934b633fe2e",
  };
  test("its should respond with 200 success", async () => {
    const response = await request(app)
      .post("/request")
      .send(data)
      .expect(201);
  });
});

