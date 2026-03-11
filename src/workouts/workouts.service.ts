import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateWorkoutDto) {
    return this.prisma.workoutPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        scheduledAt: new Date(dto.scheduledAt),
        userId,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
