#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/079d2fbcc31fafed687e822ceea8b06bf89280f9d5fb24dd03c435efa0b7b8f0/contract';
import endContract from '../../snapshots/079d2fbcc31fafed687e822ceea8b06bf89280f9d5fb24dd03c435efa0b7b8f0/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f5bc59b1ff1fef9ca061f273b78c311950185099fae7ed4c768eb14f61d661ba/contract';
import startContract from '../../snapshots/f5bc59b1ff1fef9ca061f273b78c311950185099fae7ed4c768eb14f61d661ba/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Favourites',
        columns: [
          col('routeLine', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Favourites',
        index: 'Favourites_routeLine_idx_3ce36778',
        columns: ['routeLine'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Favourites',
        index: 'Favourites_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Favourites',
        foreignKey: {
          name: 'Favourites_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Favourites',
        foreignKey: {
          name: 'Favourites_routeLine_fkey',
          columns: ['routeLine'],
          references: { schema: 'public', table: 'Route', columns: ['line'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
