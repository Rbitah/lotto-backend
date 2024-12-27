import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './ticket.entity';
import { PaymentsService } from '../payments/payments.service';
import { User } from '../users/user.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User, Payment]),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRATION', '1d') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TicketsService, PaymentsService],
  controllers: [TicketsController],
})
export class TicketsModule {}