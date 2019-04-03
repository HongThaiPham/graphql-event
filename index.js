/*
 * @Author: Leo Pham
 * @Date: 2019-04-03 21:28:21
 * @Last Modified by: Leo Pham
 * @Last Modified time: 2019-04-03 21:55:11
 */
const express = require("express");
const bodyParser = require("body-parser");

const grapqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use(
  "/graphql",
  grapqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            date: String!
        }
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: args => {
        return ["a", "b", "c", "d"];
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: new Date(args.eventInput.date)
        };
        return event;
      }
    },
    graphiql: true
  })
);

app.listen(3000, () => {
  console.log("app running ...");
});
