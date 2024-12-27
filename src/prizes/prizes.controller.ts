import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { PrizesService } from './prizes.service';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Post()
  async create(@Body() body: { position: number; amount: number }) {
    return this.prizesService.create(body.position, body.amount);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { position: number; amount: number }
  ) {
    return this.prizesService.update(id, body.position, body.amount);
  }
} 