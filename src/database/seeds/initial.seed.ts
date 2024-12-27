import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitialDatabaseSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await queryRunner.manager.save(User, {
        email: 'admin@christmaslotto.com',
        password: adminPassword,
        role: 'admin',
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
} 