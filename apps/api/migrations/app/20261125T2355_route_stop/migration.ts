#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a33ea7e7020b20354710208634465d84695e481585baf487d5d92de920fcba4f/contract';
import endContract from '../../snapshots/a33ea7e7020b20354710208634465d84695e481585baf487d5d92de920fcba4f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/aa219e093ad7000bd07261e1409d161f84e9f8741e4fc2b7774b6892ce8456ec/contract';
import startContract from '../../snapshots/aa219e093ad7000bd07261e1409d161f84e9f8741e4fc2b7774b6892ce8456ec/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'RouteStop',
        columns: [
          col('routeLine', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('stopCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['routeLine', 'stopCode'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RouteStop',
        index: 'RouteStop_routeLine_idx_3ce36778',
        columns: ['routeLine'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RouteStop',
        index: 'RouteStop_stopCode_idx_beae5384',
        columns: ['stopCode'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RouteStop',
        foreignKey: {
          name: 'RouteStop_routeLine_fkey',
          columns: ['routeLine'],
          references: { schema: 'public', table: 'Route', columns: ['line'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RouteStop',
        foreignKey: {
          name: 'RouteStop_stopCode_fkey',
          columns: ['stopCode'],
          references: { schema: 'public', table: 'Stop', columns: ['code'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
