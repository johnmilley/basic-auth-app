const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/user");


// passport authentication function
passport.use(
    new LocalStrategy(async(username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        };
        // compare password entered with hased password in db
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              // passwords match! log user in
              return done(null, user)
            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" })
            }
        })
      } catch(err) {
        return done(err);
      };
    })
);

// serialize and deserialize
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err);
    };
});

// export passport
module.exports = passport;