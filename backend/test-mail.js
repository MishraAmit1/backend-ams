// // test-email.js  VALPTQYZBKUK7VCJW28M9WX2
// //
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// const testEmail = async () => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"Test" <${process.env.EMAIL_USER}>`,
//       to: "amitmishra7427@gmail.com",
//       subject: "Test Email",
//       text: "This is a test email.",
//     });

//     console.log("Email sent:", info.messageId);
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };

// testEmail();

import sgMail from "@sendgrid/mail";
import { throwApiError } from "./apiError.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text,
      html,
    };
    const info = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    throw throwApiError(500, "Failed to send email");
  }
};
