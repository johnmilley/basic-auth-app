// router
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/user");
const isAuthenticated = require("./authMiddleware").isAuthenticated;


// home page
router.get("/", (req, res) => {
    res.render("index", { user: req.user })
});

// log in page
router.post("/log-in", passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
);

// sign up page
router.get("/sign-up", (req, res) => res.render("sign-up-form"));

// sign up form
router.post("/sign-up", async (req, res, next) => {
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

router.get("/secret", isAuthenticated, (req, res, next) => res.render("secret"));

router.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;