const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");

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
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("User does not exists");
      }

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("Password is not correct");
      }

      const jwtToken = jsonWebToken.sign(
        {
          userId: user.id,
          email: user.email
        },
        "this-is-my-secret-key",
        {
          expiresIn: "1h"
        }
      );
      return {
        userId: user.id,
        token: jwtToken,
        tokenExp: 1
      };
    } catch (error) {
      throw error;
    }
  }
};
