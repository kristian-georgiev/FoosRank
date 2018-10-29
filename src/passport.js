const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const Player = require('./models/player');

// set up passport configs
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // in .env
  callbackURL: '/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
  Player.findOne({
    'googleid': profile.id 
  }, function(err, user) { // res not err
    if (err) return done(err);

    if (!user) {
      const user = new User({
        name: profile.displayName,
        googleid: profile.id
      });

      user.save(function(err) {
        if (err) console.log(err);

        return done(err, user);
      });
    } else {
      return done(err, user);
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

module.exports = passport;