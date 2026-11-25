import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RouteService {

  constructor(private prisma: PrismaService) {}

  async getRoutes() {
    const routes = await this.prisma.db.orm.public.Route
      .all();

    return routes;
  }

  async createRoute(line: string, name: string, sort_order: number) {
    const route = await this.prisma.db.orm.public.Route
      .create({
        line,
        name,
        sort_order,
      });

    return route;
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


  
