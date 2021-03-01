const express = require('express')
const passport = require('passport')
const router = express.Router()

//custom validations
const {
    validateSignUp,
    validateSignIn,
    forgetPasswordValidator,
    resetPasswordValidator
} = require('../helpers/validate')

const requireJwtAuth = require('../middleware/requireJwtAuth')

const requireLocalAuth = require('../middleware/requireLocalAuth')

const { register, activate, forgetPassword, resetPassword } = require('../controllers/auth.controller')

const clientUrl = process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV

//normal routes
router.post('/register', validateSignUp, register)
router.post('/activate', activate)
router.post('/login', requireLocalAuth, validateSignIn, (req, res) => {
    const user = req.user
    res.json({ message: user})
})
router.post('/forgetPassword', forgetPasswordValidator, forgetPassword)
router.post('/resetPassword', resetPasswordValidator, resetPassword)

//Google routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}))
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/', session: false }),
    (req, res) => {
        const token = req.user
        res.cookie('x-auth-cookie', token)
        res.redirect(clientUrl)
    }
)

//Facebook routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email']}))
router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/', session: false }),
    (req, res) => {
        const token = req.user
        res.cookie('x-auth-cookie', token)
        res.redirect(clientUrl)
    }
)

//refresh token
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    const me = req.user
    res.json({ me })
})




module.exports = router