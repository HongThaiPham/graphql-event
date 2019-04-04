const Event = require("../../models/event");

const { tranformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate("creator");
      return events.map(event => {
        return tranformEvent(event);
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

    try {
      const result = await event.save();

      const createdEvent = tranformEvent(result);
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
  }
};
