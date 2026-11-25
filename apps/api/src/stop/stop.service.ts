import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StopService {
  constructor(private readonly prisma: PrismaService) {}

  async getStops() {
    return this.prisma.db.orm.public.Stop.all();
  }

  async createStop(code: string, name: string, lon: number, lat: number) {
    return this.prisma.db.orm.public.Stop.create({ code, name, lon, lat });
  }

  async updateStop(
    codeToUpdate: string,
    code: string,
    name: string,
    lon: number,
    lat: number,
  ) {
    const stop = await this.prisma.db.orm.public.Stop
      .where({ code: codeToUpdate })
      .update({ code, name, lon, lat });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    return stop;
  }

  async deleteStop(code: string) {
    const stop = await this.prisma.db.orm.public.Stop
      .where({ code })
      .delete();

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    return stop;
  }
}
