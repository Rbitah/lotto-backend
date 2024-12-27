module.exports = {
  type: 'mysql',
  url: process.env.MYSQL_PUBLIC_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/database/migrations',
  },
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}; 