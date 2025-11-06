import dotenv from "dotenv";

dotenv.config();

const config = {
  ports: {
    api: process.env.PORT1 || 3000,
    avankart: process.env.PORT2 || 3001,
    avankartaz: process.env.PORT3 || 3002,
    sirket: process.env.PORT3 || 3003,
    muessise: process.env.PORT3 || 3004,
  },
  useSharedDB: {
    api: true,
    avankart: true,
    avankartaz: true,
    sirket: true,
    muessise: true,
  },
  defaultLang: process.env.DEFAULT_LANG || "az",
  supportedLangs: ["az", "en", "ru", "tr"],
};

export default config;
