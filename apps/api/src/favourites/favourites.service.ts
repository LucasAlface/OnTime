import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FavouriteRequest } from './favourites.interfaces.js';

@Injectable()
export class FavouritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavourites() {
    return this.prisma.db.orm.public.Favourites.all();
  }

  async createFavourite(favourites: FavouriteRequest | FavouriteRequest[]) {
    if (!Array.isArray(favourites)) {
      return this.prisma.db.orm.public.Favourites.create(favourites);
    }

    return this.prisma.db.transaction(async (tx) => {
      const createdFavourites = [];
      for (const favourite of favourites) {
        createdFavourites.push(await tx.orm.public.Favourites.create(favourite));
      }
      return createdFavourites;
    });
  }

  async updateFavourite(
    userIdToUpdate: number,
    routeLineToUpdate: string,
    userId: number,
    routeLine: string,
  ) {
    const favourite = await this.prisma.db.orm.public.Favourites
      .where({ userId: userIdToUpdate, routeLine: routeLineToUpdate })
      .update({ userId, routeLine });

    if (!favourite) {
      throw new NotFoundException('Favourite not found');
    }

    return favourite;
  }

  async deleteFavourite(userId: number, routeLine: string) {
    const favourite = await this.prisma.db.orm.public.Favourites
      .where({ userId, routeLine })
      .delete();

    if (!favourite) {
      throw new NotFoundException('Favourite not found');
    }

    return favourite;
  }
}
