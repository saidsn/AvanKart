export const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const specialChars = "!@-_$?";
  let password = "";

  // İlk 7 simvol
  for (let i = 0; i < 7; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 1 special simvol
  password += specialChars.charAt(
    Math.floor(Math.random() * specialChars.length)
  );

  return password;
};
