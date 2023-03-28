module.exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("You must be logged in to view this page");
}

// module.exports.isAdmin = function(req, res, next) {
//     if (req.user && req.user.isAdmin) {
//         return next();
//     }
//     res.status(401).send("You must be an admin to view this page");
// }