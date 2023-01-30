const nodemailer = require('nodemailer');


const sendEmail =  async data_email => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: data_email.email,
        subject: data_email.subject,
        text: data_email.message,
    };

    // actually send the email
    
   await transporter.sendMail(mailOptions)
}

module.exports =sendEmail;