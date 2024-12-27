import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1709123456789 implements MigrationInterface {
  name = 'CreateInitialTables1709123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        userId VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE tickets (
        ticketId VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        totalPrice DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        isValid BOOLEAN DEFAULT false,
        isWinner BOOLEAN DEFAULT false,
        position INT,
        paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        drawDate TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId)
      );

      CREATE TABLE payments (
        paymentId VARCHAR(36) PRIMARY KEY,
        tx_ref VARCHAR(255) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        userId VARCHAR(36) NOT NULL,
        ticketId VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completedAt TIMESTAMP,
        paymentDetails JSON,
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (ticketId) REFERENCES tickets(ticketId)
      );

      CREATE TABLE draws (
        drawId VARCHAR(36) PRIMARY KEY,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        totalPrizePool DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending'
      );

      CREATE TABLE prizes (
        prizeId VARCHAR(36) PRIMARY KEY,
        position INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        drawId VARCHAR(36) NOT NULL,
        ticketId VARCHAR(36),
        FOREIGN KEY (drawId) REFERENCES draws(drawId),
        FOREIGN KEY (ticketId) REFERENCES tickets(ticketId)
      );

      CREATE TABLE reviews (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        likes INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS prizes;
      DROP TABLE IF EXISTS draws;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS tickets;
      DROP TABLE IF EXISTS users;
    `);
  }
} 