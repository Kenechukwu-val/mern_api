const passport = require('passport')
const { ExtractJwt, JwtStrategy } = require('passport-jwt')

const User = require('../models/user.model')

const { JWT_SECRET_PROD, JWT_SECRET_DEV } = process.env

const isProduction = process.env.NODE_ENV === 'production'
const secretOrKey = isProduction ? JWT_SECRET_PROD : JWT_SECRET_DEV

//JWT Strategy
const jwtLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromHeader('x-auth-token'),
        secretOrKey
    },

    async ( payload, done ) => {
        try {
            const user = await User.findById(payload.id)

            if (user) {
                done(null, user)
            } else {
                done(null, false)
            }
        } catch ( err ) {
            done(err, false)
        }
    }
)

passport.use(jwtLogin)