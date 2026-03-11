export class CreateWorkoutDto {
  title: string;
  description: string;
  scheduledAt: string; // ISO date string from client; converted to Date in service
}
