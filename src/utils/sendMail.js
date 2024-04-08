import ApiError from "./ApiError.js";
import smtpTransport from "../config/smtp.config.js";

export const validateEmail = email => {
    const isValidEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return isValidEmail.test(email);
};

export const sendEmail = async (email, otp) => {
    try {
        await new Promise((resolve, reject) => {
            smtpTransport.verify((error, success) => {
                if (error) {
                    reject(new ApiError(error, 500));
                } else {
                    resolve();
                }
            });
        });

        const response = await smtpTransport.sendMail({
            to: email,
            subject: "BusGo - OTP",
            html: `<h1>Your OTP for BusGo is ${otp}</h1>`
        });

        return response.accepted.length > 0 ? true : false;
    } catch (error) {
        throw new ApiError(error, 500);
    }
};
