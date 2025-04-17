// src/config/passport.config.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/User");
const { isValidPassword } = require("../utils/hash");

const cookieExtractor = (req) => req?.cookies?.jwt || null;

module.exports = function initializePassport() {
  // Estrategia de Login
  passport.use("login", new LocalStrategy({
    usernameField: "email",
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !isValidPassword(user, password)) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Estrategia para acceder al usuario actual desde el token
  passport.use("current", new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET
  }, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
};
