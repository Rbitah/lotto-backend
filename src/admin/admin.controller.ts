import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdatePrizeStructureDto } from './dto/update-prize-structure.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @ApiTags('Admin')
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Roles('admin')
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('tickets/recent')
  async getRecentTickets() {
    return this.adminService.getRecentTickets();
  }

  @Get('winners/recent')
  async getRecentWinners() {
    return this.adminService.getRecentWinners();
  }

  @Get('revenue/monthly')
  @ApiOperation({ summary: 'Get monthly revenue data' })
  @ApiResponse({ status: 200, description: 'Returns monthly revenue data' })
  async getMonthlyRevenue() {
    return this.adminService.getMonthlyRevenue();
  }

  @Post('draws/trigger')
  @ApiOperation({ summary: 'Trigger a new draw' })
  @ApiResponse({ status: 201, description: 'Draw triggered successfully' })
  async triggerDraw() {
    return this.adminService.triggerDraw();
  }

  @Put('prizes')
  @ApiOperation({ summary: 'Update prize structure' })
  @ApiResponse({ status: 200, description: 'Prize structure updated' })
  async updatePrizeStructure(@Body() prizeStructure: UpdatePrizeStructureDto) {
    return this.adminService.updatePrizeStructure(prizeStructure);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Invalidate a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket invalidated' })
  async invalidateTicket(@Param('id') ticketId: string) {
    return this.adminService.invalidateTicket(ticketId);
  }

  @Get('winners')
  @ApiOperation({ summary: 'Get all winners' })
  @ApiResponse({ status: 200, description: 'Returns all winners' })
  async getAllWinners() {
    return this.adminService.getAllWinners();
  }
}
