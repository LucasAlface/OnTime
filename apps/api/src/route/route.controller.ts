import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { RouteService } from './route.service.js';
import type { RouteRequest } from './route.interfaces.js';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async getRoutes() {
    const routes = await this.routeService.getRoutes();
    return routes;
  }

  @Post("create")
  async createRoute(@Body() body: RouteRequest | RouteRequest[]) {
    return this.routeService.createRoute(body);
  }

  @Post("update/:line")
  async updateRoute(
    @Param('line') line: string,
    @Body() body: RouteRequest
  ) {
    const route = await this.routeService.updateRoute(line, body.line, body.name, body.sort_order);
    return route;
  }

  @Post("delete/:line")
  async deleteRoute(
    @Param('line') line: string
  ) {
    await this.routeService.deleteRoute(line);
  }
}
