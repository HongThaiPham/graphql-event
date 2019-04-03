/*
 * @Author: Leo Pham
 * @Date: 2019-04-03 21:28:21
 * @Last Modified by: Leo Pham
 * @Last Modified time: 2019-04-03 21:30:08
 */
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000, () => {
  console.log("app running ...");
});
