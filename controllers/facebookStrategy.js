const Passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const JWT = require('jsonwebtoken')

const User = require('../models/user.model')

const { 
    SERVER_URL_PROD, SERVER_URL_DEV, 
    FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, 
    FACEBOOK_CALLBACK_URL
} = process.env

const isProduction = process.env.NODE_ENV === "production"
const serverUrl = isProduction ? SERVER_URL_PROD : SERVER_URL_DEV

const facebookLogin = new FacebookStrategy(
    {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: `${serverUrl}${FACEBOOK_CALLBACK_URL}`,
        profileFields: [
            'id',
            'email',
            'gender',
            'profileUrl',
            'displayName',
            'locale',
            'name',
            'timezone',
            'updated_time',
            'verified',
            'picture.type(large)',
        ],
    },

    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        try {
            const oldUser = await User.findOne({ email: profile.emails[0].value })

            if (oldUser) {

                const token = JWT.sign(
                    {
                        id: oldUser._id,
                        email: oldUser.email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '7d'
                    }
    
                )

                return done(null, token)
            }
            
        } catch (err) {
            console.log(err)
        }

        let password = process.env.JWT_SECRET + profile.email

        try {
            const newUser = await new User({
                email: profile.emails[0].value,
                password,
                avatar: profile.photos[0].value
            }).save()

            const token = JWT.sign(
                {
                    id: newUser._id,
                    email: newUser.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '7d'
                }

            )

            done(null, token)
        } catch (err) {
            console.log(err)
        }
    }
)

Passport.use(facebookLogin)

