import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RouteStopRequest } from './route_stop.interfaces.js';

@Injectable()
export class RouteStopService {
  constructor(private readonly prisma: PrismaService) {}

  async getRouteStops() {
    return this.prisma.db.orm.public.RouteStop.all();
  }

  async createRouteStop(routeStops: RouteStopRequest | RouteStopRequest[]) {
    if (!Array.isArray(routeStops)) {
      return this.prisma.db.orm.public.RouteStop.create(routeStops);
    }

    return this.prisma.db.transaction(async (tx) => {
      const createdRouteStops = [];
      for (const routeStop of routeStops) {
        createdRouteStops.push(await tx.orm.public.RouteStop.create(routeStop));
      }
      return createdRouteStops;
    });
  }

  async updateRouteStop(
    routeLineToUpdate: string,
    stopCodeToUpdate: string,
    routeLine: string,
    stopCode: string,
  ) {
    const routeStop = await this.prisma.db.orm.public.RouteStop
      .where({ routeLine: routeLineToUpdate, stopCode: stopCodeToUpdate })
      .update({ routeLine, stopCode });

    if (!routeStop) {
      throw new NotFoundException('Route-stop relation not found');
    }

    return routeStop;
  }

  async deleteRouteStop(routeLine: string, stopCode: string) {
    const routeStop = await this.prisma.db.orm.public.RouteStop
      .where({ routeLine, stopCode })
      .delete();

    if (!routeStop) {
      throw new NotFoundException('Route-stop relation not found');
    }

    return routeStop;
  }
}
