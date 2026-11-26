import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StopRequest } from './stop.interfaces.js';

@Injectable()
export class StopService {
  constructor(private readonly prisma: PrismaService) {}

  async getStops() {
    return this.prisma.db.orm.public.Stop
      .include('routes')
      .all();
  }

  async createStop(stops: StopRequest | StopRequest[]) {
    if (!Array.isArray(stops)) {
      return this.prisma.db.orm.public.Stop.create(stops);
    }

    return this.prisma.db.transaction(async (tx) => {
      const createdStops = [];
      for (const stop of stops) {
        createdStops.push(await tx.orm.public.Stop.create(stop));
      }
      return createdStops;
    });
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
