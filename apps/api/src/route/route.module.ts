import { Module } from '@nestjs/common';
import { RouteController } from './route.controller.js';
import { RouteService } from './route.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}