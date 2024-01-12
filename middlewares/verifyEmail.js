const { sendgridToken } = require('../../configs/serverConfig');
const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(sendgridToken);

const verifyEmail = async (email, verificationToken) => {
    const verificationLink = `http://localhost:3000/api/users/verify/${verificationToken}`;

    const msg = {
        to: email,
        from: 'svictoria951@gmail.com',
        subject: 'Verify Your Email',
        text: `Click the following link to verify your email: ${verificationLink}`,
        html: `<p>Click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
      };

      await sgMail.send(msg);
};

module.exports = { verifyEmail };