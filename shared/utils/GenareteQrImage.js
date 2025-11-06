
import QRCode from "qrcode";

/**
 * @param {string} code
 * @returns {Promise<string|null>} 
 */
export const generateQrImage = async (code) => {
    try {

        if (!code || typeof code !== "string" || code.trim() === "") {
            throw new Error("QR kod üçün etibarlı mətn təqdim edilməyib");
        }


        const qrImage = await QRCode.toDataURL(code.trim(), {
            errorCorrectionLevel: "H",
            type: "image/png",
            margin: 1,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            }
        });

        return qrImage;
    } catch (error) {
        console.log("QR şəkli yaradılarkən xəta:", error.message);
        return null;
    }
};