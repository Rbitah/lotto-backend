import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { DatabaseSeederService } from '../seeders/database-seeder.service';

@Injectable()
export class SeedCommand {
  constructor(private readonly seederService: DatabaseSeederService) {}

  @Command({
    command: 'seed',
    describe: 'Seed the database with initial data',
  })
  async seed() {
    try {
      await this.seederService.seed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Database seeding failed:', error);
      process.exit(1);
    }
  }
} 