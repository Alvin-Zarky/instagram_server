import {config} from "dotenv"
import { OptionMailer } from "../types/user"
import * as nodemailer from "nodemailer"

config()
const sendMailer = async (options:OptionMailer) =>{

  let transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: Number(process.env.SMTP_PORT),
    // secure: false,
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASS,
      // user: process.env.SMTP_EMAIL,
      // pass: process.env.SMTP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    // text: options.message
    // html: "<b>Hello world?</b>",
  });
  
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export default sendMailer