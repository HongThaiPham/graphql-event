const User = require("../../models/user");
const bcrypt = require("bcrypt");

module.exports = {
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
