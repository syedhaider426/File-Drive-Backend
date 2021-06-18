import privateKeys from "./privateKeys";

export const prodKeys: privateKeys = {
  db: process.env.DB || "",
  port: Number(process.env.PORT),
  passportKey: process.env.PASSPORTKEY || "",
  email: process.env.EMAIL || "",
  sendgrid_api_key: process.env.SENDGRID_API_KEY || "",
  jwtPrivateKey: process.env.JWT_PRIVATEKEY || "",
  connection: process.env.CONNECTION,
};
