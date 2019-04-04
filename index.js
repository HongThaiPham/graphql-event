/*
 * @Author: Leo Pham
 * @Date: 2019-04-03 21:28:21
 * @Last Modified by: leopham - hongthaipro@gmail.com
 * @Last Modified time: 2019-04-04 14:01:51
 */
const express = require("express");
const bodyParser = require("body-parser");

const grapqlHttp = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const mongoose = require("mongoose");

const isAuth = require("./middleware/is-auth");
const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use(isAuth);

app.use(
  "/graphql",
  grapqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PWD
    }@cluster0-tghgo.mongodb.net/${process.env.MONGO_DB}`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("app running ...");
    });
  })
  .catch(err => {
    console.log(err);
  });
