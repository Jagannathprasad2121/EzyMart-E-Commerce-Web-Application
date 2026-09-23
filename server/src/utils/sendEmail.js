const nodemailer = require('nodemailer');

const sendMail = async (to, sub, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOption = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: sub,
            text: text
        };

        await transporter.sendMail(mailOption);

        console.log("Email sent successfully");
    } catch (error) {
        console.log("Error sending email:", error);
    }
};

module.exports = sendMail;