const mailgun = require('mailgun-js')


//mailgun domain
const DOMAIN = process.env.DOMAIN
//mailgun apiKey
const apiKey = process.env.APIKEY
const mg = mailgun({ apiKey: apiKey, domain: DOMAIN })

const { EMAIL_FROM } = process.env

const sendEmail = ( to, url, txt ) => {

    const emailData = {
        from: EMAIL_FROM,
        to: to,
        subject: 'Account activation link',
        html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Hello ${to}</h2>
            <p>Thanks for signing up to Ducelink, great to have you!</p>
            <p>Please verify your email address by clicking the link below.</p>
            
            <a href=${url} style="background: #FF6B00; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${url}</div>
            </div>
        `
    }

    mg.messages().send(emailData, (err, body) => {
        if ( err ) return err;

        return body
    })
    
}

const sendmailforPassword = ( to, url, txt ) => {

    const emailData = {
        from: EMAIL_FROM,
        to: to,
        subject: 'Password reset link',
        html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Please click the link to reset your password</h2>
            <a href=${url} style="background: #FF6B00; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${url}</div>
            </div>
        `
    }

    mg.messages().send(emailData, (err, body) => {
        if ( err ) return err;

        return body
    })
}

module.exports = {
    sendEmail,
    sendmailforPassword
}