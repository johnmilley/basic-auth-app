/////// app.js

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');


// config file imports
const passport = require("./config/passport");

// create app
const app = express();

// load environment variables
const dotenv = require("dotenv");
dotenv.config();

// connect to mongo
const mongoDb = `${process.env.MONGO_URI}`;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// set up static files (css, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// create a session
app.use(session({ 
    secret: "mr. dressup",  // store this in an environment variable
    resave: false, 
    saveUninitialized: true, 
    store: MongoStore.create({ mongoUrl: mongoDb }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day, in milliseconds
    }
}));

// passport config
app.use(passport.initialize());
app.use(passport.session());  // HOVER OVER THIS TO SEE WHAT IT DOES. DO IT!
app.use(express.urlencoded({ extended: false }));

// middleware that logs the session and user objects
app.use((req, res, next) => {

    // if (req.session.viewCount) {
    //     req.session.viewCount++;
    // } else {
    //     req.session.viewCount = 1;
    // }

    // console.log(`\n views: ${req.session.viewCount}\n`)

    console.log("\nreq.session", req.session);
    console.log("\nreq.user", req.user);  
    console.log("--------------------\n")
    next();
});

// middleware that gives you access to `currentUser` in all templates (null if no user is logged in)
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// define routes
const routes = require("./routes/routes");
app.use("/", routes);

app.listen(3000, () => console.log("app listening on port 3000!"));