/*
 * @Author: Leo Pham
 * @Date: 2019-04-03 21:28:21
 * @Last Modified by: leopham - hongthaipro@gmail.com
 * @Last Modified time: 2019-04-04 09:15:07
 */
const express = require("express");
const bodyParser = require("body-parser");

const grapqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");

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
            creator: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
            title: String!
            description: String!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
          date: new Date(args.eventInput.date),
          creator: "5ca5676288e9400a7261099f"
        });
        let createdEvent = {};
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: result.id };
            return User.findById("5ca5676288e9400a7261099f");
          })
          .then(user => {
            if (!user) {
              throw new Error("User not exist");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email }).then(user => {
          if (!user) {
            return bcrypt
              .hash(args.userInput.password, 12)
              .then(hasedPassword => {
                const user = new User({
                  email: args.userInput.email,
                  password: hasedPassword
                });
                return user.save();
              })
              .then(result => {
                return { ...result._doc, _id: result.id, password: null };
              })
              .catch(err => {
                throw err;
              });
          } else {
            throw new Error("User existed");
          }
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
