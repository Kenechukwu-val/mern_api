const Passport = require('passport')

const requireJwtAuth =
    Passport.authenticate('jwt', { session: false })

module.exports = requireJwtAuth