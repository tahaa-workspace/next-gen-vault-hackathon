import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/next_gen_vault',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieName: process.env.COOKIE_NAME || 'ngv_token',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};

export default config;
