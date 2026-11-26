import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RouteStopService } from './route_stop.service.js';
import type { RouteStopRequest } from './route_stop.interfaces.js';

@Controller('route_stop')
export class RouteStopController {
  constructor(private readonly routeStopService: RouteStopService) {}

  @Get()
  async getRouteStops() {
    return this.routeStopService.getRouteStops();
  }

  @Post('create')
  async createRouteStop(@Body() body: RouteStopRequest | RouteStopRequest[]) {
    return this.routeStopService.createRouteStop(body);
  }

  @Post('update/:routeLine/:stopCode')
  async updateRouteStop(
    @Param('routeLine') routeLine: string,
    @Param('stopCode') stopCode: string,
    @Body() body: RouteStopRequest,
  ) {
    return this.routeStopService.updateRouteStop(
      routeLine,
      stopCode,
      body.routeLine,
      body.stopCode,
    );
  }

  @Post('delete/:routeLine/:stopCode')
  async deleteRouteStop(
    @Param('routeLine') routeLine: string,
    @Param('stopCode') stopCode: string,
  ) {
    return this.routeStopService.deleteRouteStop(routeLine, stopCode);
  }
}
