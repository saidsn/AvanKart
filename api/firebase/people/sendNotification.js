import admin from "../../../muessise/firebase/firebaseAdmin.js";

export const sendPeopleNotification = async ({ title, body, data = {}, tokens = [] }) => {
  try {
    let tokenList = tokens;

    if (!tokenList || tokenList.length === 0) {
      const testToken = process.env.TEST_FCM_TOKEN;
      if (!testToken) {
        return { success: false, message: "Firebase token tapılmadı" };
      }
      tokenList = [testToken];
    }

    const normalizedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [String(k), String(v)])
    );

    let response;

    if (tokenList.length === 1) {
      response = await admin.messaging().send({
        token: tokenList[0],
        notification: { title, body },
        data: normalizedData,
      });
    } else {
      response = await admin.messaging().sendMulticast({
        tokens: tokenList,
        notification: { title, body },
        data: normalizedData,
      });
    }

    return { success: true, result: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default sendPeopleNotification;
