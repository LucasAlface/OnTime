import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StopService } from './stop.service.js';
import type { StopRequest } from './stop.interfaces.js';

@Controller('stop')
export class StopController {
  constructor(private readonly stopService: StopService) {}

  @Get()
  async getStops() {
    return this.stopService.getStops();
  }

  @Post('create')
  async createStop(@Body() body: StopRequest) {
    return this.stopService.createStop(body.code, body.name, body.lon, body.lat);
  }

  @Post('update/:code')
  async updateStop(
    @Param('code') code: string,
    @Body() body: StopRequest,
  ) {
    return this.stopService.updateStop(code, body.code, body.name, body.lon, body.lat);
  }

  @Post('delete/:code')
  async deleteStop(@Param('code') code: string) {
    return this.stopService.deleteStop(code);
  }
}
