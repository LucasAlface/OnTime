import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RouteStopController } from './route_stop.controller.js';
import { RouteStopService } from './route_stop.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [RouteStopController],
  providers: [RouteStopService],
})
export class RouteStopModule {}
