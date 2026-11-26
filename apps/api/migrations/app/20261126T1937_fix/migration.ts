#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/079d2fbcc31fafed687e822ceea8b06bf89280f9d5fb24dd03c435efa0b7b8f0/contract';
import startContract from '../../snapshots/079d2fbcc31fafed687e822ceea8b06bf89280f9d5fb24dd03c435efa0b7b8f0/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/48df758e4044e98ad9869fdcd6c63a1162397c77187c2b92f02d5981ef1e377d/contract';
import endContract from '../../snapshots/48df758e4044e98ad9869fdcd6c63a1162397c77187c2b92f02d5981ef1e377d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addPrimaryKey({
        schema: 'public',
        table: 'Favourites',
        constraint: 'Favourites_pkey',
        columns: ['userId', 'routeLine'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
