const Passport = require('passport')

const requireLocalAuth = ( req, res, next ) => {
    Passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }

        if (!user) {
            return res.status(422).json({ message: info })
        }

        req.user = user
        next()
    })(req, res, next)
}

module.exports = requireLocalAuth
