import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../models/user.js';

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Pass the `email` and `password` parameters to the callback
passport.use(new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  }, ((email, password, done) => {
    User.findOne({ email: email }).exec() // Chain `.exec()` method to query object
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        user.comparePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user); // Return user if email and password are correct
          })
          .catch(error => done(error));
      })
      .catch(error => done(error)); // Handle errors with a `.catch()` block
  })));

export default passport;