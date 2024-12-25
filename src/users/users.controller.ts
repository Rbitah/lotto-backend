import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; role: string; username: string }): Promise<User> {
    return this.usersService.register(body.email, body.password, body.username, body.role);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }): Promise<{ accessToken: string }> {
    return this.usersService.login(body.email, body.password);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }): Promise<void> {
    return this.usersService.resetPassword(body.email, body.newPassword);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }): Promise<void> {
    return this.usersService.changePassword(req.userId, body.oldPassword, body.newPassword);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Post('admin-only')
  adminOnlyEndpoint() {
    return 'This is an admin-only endpoint';
  }
} 