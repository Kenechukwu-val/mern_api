//validation helpers
const { check } = require('express-validator')

//Register Validations
exports.validateSignUp = [
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'Password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters')

]


//Login validations
exports.validateSignIn = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password', 'Password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters')

]

//Forget password
exports.forgetPasswordValidator = [
    check('email').not().isEmpty().isEmail().withMessage('Must be a valid email address')
]

///Reset password
exports.resetPasswordValidator = [
    check('newPassword').not().isEmpty().isLength({
        min: 6
    })
    .withMessage('Password must be at least 6 characters long')
]