const bcrypt = require("bcrypt");
const Event = require("../../models/event");
const User = require("../../models/user");

const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser.bind(this, event._doc.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate("creator");
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: getUser.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      date: new Date(args.eventInput.date),
      creator: "5ca575bf67074311f03a3bdf"
    });
    let createdEvent;
    try {
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        creator: getUser.bind(this, result._doc.creator)
      };
      const creator = await User.findById("5ca575bf67074311f03a3bdf");

      if (!creator) {
        throw new Error("User not exist");
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
  createUser: async args => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error("User existed");
      }

      const hasedPassword = await bcrypt.hash(args.userInput.password, 12);

      const newuser = new User({
        email: args.userInput.email,
        password: hasedPassword
      });
      const result = await newuser.save();

      return { ...result._doc, _id: result.id, password: null };
    } catch (err) {
      throw err;
    }
  }
};
