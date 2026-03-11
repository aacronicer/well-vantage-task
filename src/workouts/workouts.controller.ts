import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './create-workout.dto';
import { User } from '../generated/prisma';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(@Req() req: { user: User }, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: { user: User }) {
    return this.workoutsService.findAllForUser(req.user.id);
  }
}
