import { Controller, Get, Post, Body, UseGuards, Request, Put, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async getAllReviews() {
    return this.reviewsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id/like')
  async likeReview(@Param('id') id: string) {
    return this.reviewsService.incrementLikes(id);
  }
} 