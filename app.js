/////// app.js

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

dotenv.config();

// connect to mongo
const mongoDb = `${process.env.MONGO_URI}`;
console.log(mongoDb)
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// create user model
const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();

// set up view engine
app.set("views", __dirname);
app.set("view engine", "pug");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

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

// passport config
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// middleware to make user available in templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});  

// routes
app.get("/", (req, res) => {
    res.render("index", { user: req.user })
});

app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req, res, next) => {
    try {
        bcrypt.hash(req.body.password, 10, async function(err, hash) {
            if (err) {
                return next(err);
            }
            
            // Store hash in your password DB.
            const user = new User({
                username: req.body.username,
                password: hash
            });

            const result = await user.save();
            res.redirect("/");
        }); 
    } catch(err) {
        return next(err);
    };
});

app.post("/log-in", passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
);

app.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.listen(3000, () => console.log("app listening on port 3000!"));