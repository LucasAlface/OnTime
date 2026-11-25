import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StopController } from './stop.controller.js';
import { StopService } from './stop.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StopController],
  providers: [StopService],
})
export class StopModule {}
