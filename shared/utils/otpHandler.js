import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import User from '../models/partnyorUserModel.js';
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
    if (debugMode) return true;

    const url = `${process.env.SMILE_URL}?username=${process.env.SMILE_USER}&password=${process.env.SMILE_PASS}&numberId=${process.env.SMILE_NUMBER_ID}&msisdn=${msisdn}&msgBody=${otp}`;

    try {
        const res = await axios.get(url);
        const resTxt = res.data;
        if (res.status === 200 && res.data.includes("OK")) {
            return true;
        }
        else {
            console.error("SMS send failed:", resTxt);
            return false;
        }
    } catch (error) {
        console.error("SMS send error:", error.message);

        return false;
    }
};


export const sendMail = async (to, otp, debugMode = false, subj) => {
    const subject = subj ? otp : 'Your OTP Code';
    const text = subj ? otp : `Your OTP code is: ${otp}`;
    if (debugMode) return true;

    // Minimal env presence check (silent)

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.SMTP_MAIL, pass: process.env.SMTP_PASS }
        });
        // Removed verbose transporter.verify debugging

        const mailOpts = {
            from: `"Avankart" <${process.env.SMTP_MAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html: text
        };
        await transporter.sendMail(mailOpts);
        return true;
    } catch (error) {
        console.error('Email send error:', error.message);
        return false;
    }
};

//Send Social Function
export const sendSocial = async (otp, phone_suffix, phone_number, social = 'whatsapp', debugMode = false) => {
    if (debugMode) return true;
    return false;
};

export const verifyAuthenticator = async (secret, code, debug = false) => {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1 // 30s window
    });

    if (debug) console.log("[verifyAuthenticator] Secret:", secret, "Code:", code, "Verified:", verified);

    return { success: verified, message: verified ? 'OTP verified successfully' : 'Invalid OTP code' };
  } catch (error) {
    console.error("[verifyAuthenticator] Error:", error);
    return { success: false, message: 'OTP verification failed' };
  }
};




//smsChooser Function
export const smsChooser = async (destination, otp, phone_suffix, phone_number, debugMode = false) => {
    const finalOtp = otp || generateOtp();

    const trySendSocial = async () => {
        const social = await sendSocial(
            finalOtp, phone_suffix, phone_number, 'whatsapp', debugMode
        );
        if (!social) {
            throw new Error("Social send failed");
        };
        return {
            success: true,
            otp: finalOtp
        };
    };

    const trySendSms = async () => {
        const sms = await sendSms(phone_suffix, phone_number, finalOtp, debugMode);
        if (!sms) throw new Error('Sms send failed');
        return { success: true, otp: finalOtp };
    };
    try {
        if (destination === 'social') {
            return await trySendSocial();
        } else if (destination === 'sms') {
            return await trySendSms();
        } else {
            const rand = Math.random();
            if (rand < 0.7) {
                try {
                    return await trySendSocial();
                } catch {
                    return await trySendSms();
                }
            } else {
                try {
                    return await trySendSms();
                } catch {
                    return await trySendSocial();
                }
            }
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed Sending OTP',
            error: error.message
        };
    }

};
