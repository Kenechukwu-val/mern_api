const User = require('../models/user.model')
const { validationResult } = require('express-validator')
const _ = require('lodash')
const JWT = require('jsonwebtoken')
const {sendEmail, sendmailforPassword} = require('../helpers/sendMail')

//custom error handler to get useful errors from the database errors
const { errorHandler } = require('../helpers/dbErrorHandling')


const { JWT_ACTIVATION, CLIENT_URL, JWT_RESET_PASSWORD } = process.env

const register = async (req, res, next) => {
    const errors = validationResult(req)

    //validation to the request body
    if ( !errors.isEmpty() ) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            message: firstError
        })
    }

    const { email, password } = req.body

    try {
        const existingUser = await User.findOne({ email }) 
        if (existingUser) {
            return res.status(422).json({ message: 'Email already exists'})
        }

        const token = JWT.sign({email,password},
            JWT_ACTIVATION,
            {
                expiresIn: '5m'
            }
        )

        const url = `${CLIENT_URL}/users/activate/${token}`
        sendEmail(email,url,'Activate account')

        res.json({ message: `An email has been sent to ${email}` })
        
    } catch (err) {
        return next(err)
    }
}

const activate = async ( req, res ) => {
    const {token} = req.body

    if (token) {
        JWT.verify(token, JWT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: 'Expired link. Signup again'
                });
            }

            const { email, password } = JWT.decode(token)

            const user = new User({
                email,
                password
            })

            user.save((err, user) => {
                if (err) {
                    return res.status(401).json({
                        message: "User " + errorHandler(err)
    
                    });
                } else {
                    return res.json({
                        message: 'Signup Successful'
                    });
                }
            });
        })
    } else {
        return res.json({
        message: 'An error occurred, please try again'
        })
    }
}

const forgetPassword = async ( req, res, next ) => {
    const { email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            errors: firstError
        })
    } else {
        try {
            await User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with that email does not exist'
                });
            }

            const token = JWT.sign({ id: user._id}, JWT_RESET_PASSWORD, {
                expiresIn: '10m'
            })
    
            const url = `${CLIENT_URL}/users/password/reset/${token}`
            sendmailforPassword(email, url, 'Reset Password')
        
            return user.updateOne(
                {
                    resetPasswordLink: token
                },
                (err, success) => {
                    if (err) {
                        return res.status(400).json({
                            error:
                            'Database connection error on user password forgot request'
                        });
                    } else {
        
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instruction to change your password`,
                        })
        
                    }         
                }
            )   
        }) 

        } catch (err) {
            return next(err)
        }
    }
}

const resetPassword = async ( req, res ) => {
    const { resetPasswordLink, newPassword } = req.body

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            errors: firstError
        })
    } else {
        if (resetPasswordLink) {
            JWT.verify( resetPasswordLink, JWT_RESET_PASSWORD, (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        message: 'Expired Link, Please try again!'
                    })
                }
            })
        }

        try {
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        message: 'Something went wrong, Please try again!'
                    })
                }

                const updatefields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }

                user = _.extend(user, updatefields)

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                          error: 'Error resetting user password'
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                })
            })
            
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = {
    register,
    activate,
    forgetPassword,
    resetPassword
}