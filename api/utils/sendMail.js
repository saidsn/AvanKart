import path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendMail = async ({ view, to, data }) => {
  try {
    const viewPath = path.join(__dirname, '..', 'views', 'emails', `${view}.ejs`);
    const template = readFileSync(viewPath, 'utf8');
    const html = ejs.render(template, data);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Avankart Support" <${process.env.MAIL_USER}>`,
      to,
      subject: data.subject || 'Notification',
      html
    });

    return true;
  } catch (err) {
    console.error('sendMail error:', err);
    return false;
  }
};

export default sendMail;
