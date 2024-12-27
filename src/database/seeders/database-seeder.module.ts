import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommandModule } from 'nestjs-command';
import { DatabaseSeederService } from './database-seeder.service';
import { User } from '../../users/user.entity';
import { Prize } from '../../prizes/prize.entity';

@Module({
  imports: [
    ConfigModule,
    CommandModule,
    TypeOrmModule.forFeature([User, Prize]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseSeederModule {} 