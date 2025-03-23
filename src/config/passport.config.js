// src/config/passport.config.js
const passport = require("passport");
const local = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const { isValidPassword } = require("../utils/hash");

const cookieExtractor = req => req?.cookies?.jwt || null;

module.exports = function initializePassport() {
  passport.use("login", new local({
    usernameField: "email",
  }, async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user || !isValidPassword(user, password)) return done(null, false);
    return done(null, user);
  }));

  passport.use("current", new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET
  }, async (jwt_payload, done) => {
    const user = await User.findById(jwt_payload.id);
    if (!user) return done(null, false);
    return done(null, user);
  }));
};
