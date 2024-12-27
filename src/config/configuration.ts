export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.MYSQL_PUBLIC_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    adminEmail: process.env.ADMIN_EMAIL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  payment: {
    apiUrl: process.env.PAYMENT_API_URL,
    apiKey: process.env.PAYMENT_API_KEY,
    callbackUrl: process.env.PAYMENT_CALLBACK_URL,
    returnUrl: process.env.PAYMENT_RETURN_URL,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    path: process.env.LOG_PATH,
  },
}); 