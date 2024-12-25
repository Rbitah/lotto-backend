import { Controller, Post } from '@nestjs/common';
import { DrawsService } from './draws.service';

@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Post('create')
  async createDraw() {
    return this.drawsService.createDraw();
  }
} 