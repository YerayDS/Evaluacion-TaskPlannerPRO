import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export function sendWelcomeEmail(email, name) {
  const mailOptions = {
    from: '"TaskPlanner" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: '¡Bienvenido a TaskPlanner!',
    html: `<h3>Hola,</h3><p>Gracias por registrarte en <b>TaskPlanner</b>. ¡Nos alegra tenerte con nosotros!</p>`
  };

  return transporter.sendMail(mailOptions);
}