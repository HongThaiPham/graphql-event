const Booking = require("../../models/booking");
const Event = require("../../models/event");

const { tranfromBooking, tranformEvent } = require("./merge");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return tranfromBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    const fetchedEvent = await Event.findById(args.eventId);
    const booking = new Booking({
      event: fetchedEvent,
      user: req.userId
    });
    try {
      const result = await booking.save();
      return tranfromBooking(result);
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = tranformEvent(booking.event);

      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  }
};
