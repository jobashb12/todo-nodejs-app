const jwt = require("jsonwebtoken");
const { createTransport } = require("nodemailer");

const setCookie = (res, name, value) => {
  const options = {
    expires: value
      ? new Date(Date.now() + 1000 * 60 * 60 * 29)
      : new Date(Date.now() + 1000 * 60 * 60 * 5),
    httpOnly: true,
  };
  res.cookie(name, value, options);
};

const generateToken = async (key, _id) => {
  const token = await jwt.sign({ _id }, key);
  return token;
};

const generateOtp = () => Math.floor(Math.random() * 1000000);

const sendMail = async (otp, email) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  let info = await transporter.sendMail({
    from: "nodemailer",
    to: email,
    subject: "OTP Message",
    text: `Your otp is: ${otp}`,
  });
};

module.exports = { setCookie, generateToken, generateOtp, sendMail };
