import nodemailer from "nodemailer";

const sendEmail = async (email) => {
  if (!email) {
    return {
      success: false,
    };
  }

  const smtpUser = process.env.EMAIL_SERVER_USER;
  const smtpPassword = process.env.EMAIL_SERVER_PASSWORD;
  const smtpFromEmail = process.env.EMAIL_FROM;
  const smtpHost = process.env.EMAIL_SERVER_HOST;
  const smtpPort = process.env.EMAIL_SERVER_PORT;

  const subject = "Your Subject";
  const text = "Your Email body";

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: smtpFromEmail,
      to: email,
      subject,
      text,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
};

export default sendEmail;
