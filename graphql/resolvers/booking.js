const Booking = require("../../models/booking");
const Event = require("../../models/event");

const { tranfromBooking, tranformEvent } = require("./merge");

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return tranfromBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findById(args.eventId);
    const booking = new Booking({
      event: fetchedEvent,
      user: "5ca575bf67074311f03a3bdf"
    });
    try {
      const result = await booking.save();
      return tranfromBooking(result);
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async args => {
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
