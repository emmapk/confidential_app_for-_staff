import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD, 
  },
  
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

transporter.verify((error, success) => {
  if (error) {
    console.error('Error setting up email transporter:', error);
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

// Export the configured transporter
export default transporter;
