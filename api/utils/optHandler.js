import axios from 'axios';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

export const generateOtp = (digits = 6) => {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

function formatPhoneNumber(suffix, phone) {
    let formattedSuffix = suffix;

    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
    }
    return formattedSuffix + formattedPhone;
};

//Send SMS Function
export const sendSms = async (suffix, phone, otp, debugMode = false) => {
    const msisdn = formatPhoneNumber(suffix, phone);
    if (debugMode) {
        console.log(`[DEBUG] [sendSms] To: ${msisdn}, OTP: ${otp}`);
        return true;
    }

    const url = `${process.env.SMILE_URL}?username=${process.env.SMILE_USER}&password=${process.env.SMILE_PASS}&numberId=${process.env.SMILE_NUMBER_ID}&msisdn=${msisdn}&msgBody=${otp}`;

    try {
        const res = await axios.get(url);
        const resTxt = res.data;
        if (res.status === 200) {
            console.log("SMS successfully sent!");

            return true;
        } else {
            console.error("SMS send failed:", resTxt);
            return false;
        }
    } catch (error) {
        console.error("SMS send error:", error.message);

        return false;
    }
};


export const sendMail = async ({ to, data, otp, debugMode = false }) => {
    const { subject } = data;
    const text = `Your OTP code is: ${otp}`;

    if (debugMode) {
        console.log('[DEBUG] [sendMail]');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('OTP:', otp);
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP,
            port: parseInt(process.env.MAILPORT),
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        const mailOpts = {
            from: process.env.USER,
            to,
            subject,
            text
        };
        const Mailinfo = await transporter.sendMail(mailOpts);
        console.log('Email sent:', Mailinfo.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
};

//Send Social Function
export const sendSocial = async (otp, phone_suffix, phone_number, social= 'whatsapp', debugMode = false) => {
    if (debugMode) {
        console.log(`[DEBUG] [WhatsApp] ...`);
        return true;
    }
    console.log('WhatsApp Message Sending Function Not Yet Implemented.');
    return false;
}


