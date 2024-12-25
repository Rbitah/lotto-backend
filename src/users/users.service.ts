import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string,username:string, role: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashedPassword, username, role });
    return this.usersRepository.save(user);
  }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    console.log({email,password});
    const user = await this.usersRepository.findOne({ 
      where: { email },
      select: ['userId', 'email', 'password', 'role', 'username']
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      email: user.email,
      sub: user.userId,
      role: user.role,
      username: user.username
    };
console.log(payload);
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      })
    };
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { userId } });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }
} 