declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_URI: string;
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    ACCESS_EXPIRY: string;
    REFRESH_EXPIRY: string;
  }
}