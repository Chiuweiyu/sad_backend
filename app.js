// load env var
require("dotenv").config();
const compression = require('compression');
const express = require("express");
const cors = require("cors");
const app = express();

// using gzip for better performance
app.use(compression());

// allowing cors
app.use(cors());

// parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// central router
const apiRouter = require("./routes/apiRouter");
app.use("/", apiRouter);

module.exports = app;