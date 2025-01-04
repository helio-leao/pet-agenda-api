import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_AUTH_EMAIL,
    pass: process.env.NODEMAILER_AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (success) {
    return console.log("Ready for email");
  }
  console.error(error);
});

export default transporter;
