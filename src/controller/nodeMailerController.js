import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD, 
  },
  
});



transporter.verify((error, success) => {
  if(error){
    console.error("Error setting up email transporter:", error)
  } else {
  }
})

export default transporter;
