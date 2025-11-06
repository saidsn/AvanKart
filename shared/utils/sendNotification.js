import admin from "../../muessise/firebase/firebaseAdmin.js";
// import dotenv from "dotenv";
// dotenv.config();

export const sendNotification = async ({
  title,
  body,
  data = {},
  tokens = [],
}) => {
  try {
    // Əgər token boşdursa, .env-dən test tokenini istifadə et
    if (!tokens || tokens.length === 0) {
      const testToken = process.env.TEST_FCM_TOKEN;
      if (!testToken) {
        return {
          success: false,
          message: "Firebase token tapılmadı",
        };
      }
      tokens = [testToken];
    }

    // Message obyekti
    const message = {
      notification: {
        title,
        body,
      },
      data, // Optional əlavə data
      tokens,
    };

    // Tək və ya çox saylı mesaj göndərilməsi
    const response =
      tokens.length === 1
        ? await admin.messaging().send({
            token: tokens[0],
            notification: message.notification,
            data: message.data,
          })
        : await admin.messaging().sendMulticast({
            tokens,
            notification: message.notification,
            data: message.data,
          });

    return {
      success: true,
      result: response,
    };
  } catch (error) {
    console.error("[sendNotification]", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// export const sendNotification = async () => {
//   // Send notification logic will be implemented here
// };
