#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/aa219e093ad7000bd07261e1409d161f84e9f8741e4fc2b7774b6892ce8456ec/contract';
import endContract from '../../snapshots/aa219e093ad7000bd07261e1409d161f84e9f8741e4fc2b7774b6892ce8456ec/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/dd22bd0b89aae6137a5d75cb7ad2b44583279f97c2015d254ffa06395bcc548f/contract';
import startContract from '../../snapshots/dd22bd0b89aae6137a5d75cb7ad2b44583279f97c2015d254ffa06395bcc548f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Route',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('line', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sort_order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Stop',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('lat', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('lon', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Route',
        constraint: 'Route_line_key',
        columns: ['line'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Route',
        constraint: 'Route_sort_order_key',
        columns: ['sort_order'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Stop',
        constraint: 'Stop_code_key',
        columns: ['code'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
