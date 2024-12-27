import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../users/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.reviewRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
    });

    return this.reviewRepository.save(review);
  }

  async incrementLikes(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.likes += 1;
    return this.reviewRepository.save(review);
  }
} 