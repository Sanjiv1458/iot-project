import nodemailer from 'nodemailer';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Nodemailer transporter created successfully');
} catch (error) {
  console.error('Error creating Nodemailer transporter:', error.message);
}

export default transporter;
