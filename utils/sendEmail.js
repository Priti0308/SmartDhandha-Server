const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This MUST be the 16-character App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    // --- THIS IS THE IMPORTANT CHANGE ---
    console.error("--- NODEMAILER ERROR ---");
    console.error(error); // Log the full error object from Nodemailer
    console.error("--- END NODEMAILER ERROR ---");
    throw new Error("Failed to send email via Nodemailer.");
  }
};

module.exports = sendEmail;