/*
 * @Author: Leo Pham
 * @Date: 2019-04-03 21:28:21
 * @Last Modified by: leopham - hongthaipro@gmail.com
 * @Last Modified time: 2019-04-04 08:54:00
 */
const express = require("express");
const bodyParser = require("body-parser");

const grapqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const mongoose = require("mongoose");
const Event = require("./models/event");

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
        return Event.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PWD
    }@cluster0-tghgo.mongodb.net/${process.env.MONGO_DB}?authSource`,
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
