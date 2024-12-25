import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { PrizesService } from './prizes.service';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Post('create')
  async createPrize(@Body() body: { name: string; amount: number }) {
    return this.prizesService.createPrize(body.name, body.amount);
  }

  @Put('update/:id')
  async updatePrize(@Param('id') id: number, @Body() body: { name: string; amount: number }) {
    return this.prizesService.updatePrize(id, body.name, body.amount);
  }
} 