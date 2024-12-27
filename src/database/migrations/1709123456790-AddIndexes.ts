import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1709123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX idx_tickets_user ON tickets(userId);
      CREATE INDEX idx_tickets_draw ON tickets(drawDate);
      CREATE INDEX idx_tickets_status ON tickets(paymentStatus);
      CREATE INDEX idx_payments_status ON payments(status);
      CREATE INDEX idx_payments_date ON payments(createdAt);
      CREATE INDEX idx_reviews_user ON reviews(userId);
      CREATE INDEX idx_reviews_rating ON reviews(rating);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_tickets_user ON tickets;
      DROP INDEX idx_tickets_draw ON tickets;
      DROP INDEX idx_tickets_status ON tickets;
      DROP INDEX idx_payments_status ON payments;
      DROP INDEX idx_payments_date ON payments;
      DROP INDEX idx_reviews_user ON reviews;
      DROP INDEX idx_reviews_rating ON reviews;
    `);
  }
} 