import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RouteRequest } from './route.interfaces.js';

@Injectable()
export class RouteService {

  constructor(private prisma: PrismaService) {}

  async getRoutes() {
    const routes = await this.prisma.db.orm.public.Route
      .include('stops')
      .all();

    return routes;
  }

  async createRoute(routes: RouteRequest | RouteRequest[]) {
    if (!Array.isArray(routes)) {
      return this.prisma.db.orm.public.Route.create(routes);
    }

    return this.prisma.db.transaction(async (tx) => {
      const createdRoutes = [];
      for (const route of routes) {
        createdRoutes.push(await tx.orm.public.Route.create(route));
      }
      return createdRoutes;
    });
  }

  async updateRoute(lineToUpdate: string,line: string, name: string, sort_order: number) {
    const route = await this.prisma.db.orm.public.Route
      .where({ line: lineToUpdate })
      .update({
        line,
        name,
        sort_order,
      });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async deleteRoute(line: string) {
    const route = await this.prisma.db.orm.public.Route
      .where({ line })
      .delete();
  }
}


  
