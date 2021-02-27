const Passport = require('passport')
const PassportLocalStrategy = require('passport-local').Strategy
const JWT = require('jsonwebtoken')

const User = require('../models/user.model')
const { validationResult } = require('express-validator')

const { JWT_SECRET_PROD, JWT_SECRET_DEV } = process.env

const passportLogin = new PassportLocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
        passReqToCallback: true,
    },

    async( req, email, password, done ) => {
        const errors = validationResult(req)

        //validation to the request body
        if ( !errors.isEmpty() ) {
            const firstError = errors.array().map(error => error.msg)[0]
            return res.status(422).json({
                message: firstError
            })
        }

        try {
            //Checks if users exist
            const user = await User.findOne({ email: email })
            if (!user) {
                return done(null, false, { message: 'Email does not exist'})
            }

            //Authenticate users
            if(!user.authenticate(password)) {
                return done(null, false, { message: 'Incorrect Password'})
            }

            const isProduction = process.env.NODE_ENV === 'production'
            const secretOrKey = isProduction ? JWT_SECRET_PROD : JWT_SECRET_DEV

            const token = JWT.sign(
                { id: user._id, email: user.email},
                    secretOrKey,
                {
                    expiresIn: '7d'
                }
            )

            return done(null, token, {message: 'Login Successful'})
            
        } catch (err) {
            return done(err)
        }
    }
)

Passport.use(passportLogin)