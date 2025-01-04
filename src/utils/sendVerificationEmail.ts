import transporter from "../config/mailer";

const PAGE_URL = "http://localhost:5173";

export default async function sendVerificationEmail(
  email: string,
  token: string
) {
  const mailOptions = {
    from: process.env.NODEMAILER_AUTH_EMAIL,
    to: email,
    subject: "Verify your Pet Agenda account",
    html: `
        <p>You are one step closer of being able to keep an eye on the schedule of your wonderful pets</p>
        <p>Press <a href=${PAGE_URL}/verify-account/${token}>here</a> to proceed</p>
      `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
}
