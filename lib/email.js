const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'mrello@bk.ru',
        pass: 'LVCcgfGj2h2HJvQjdqa4',
    },
    tls: {
        rejectUnauthorized: false,
    },
});



module.exports = { transporter };