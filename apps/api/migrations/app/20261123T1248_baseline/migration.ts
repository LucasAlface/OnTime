#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/dd22bd0b89aae6137a5d75cb7ad2b44583279f97c2015d254ffa06395bcc548f/contract';
import endContract from '../../snapshots/dd22bd0b89aae6137a5d75cb7ad2b44583279f97c2015d254ffa06395bcc548f/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createSchema({ schema: 'tiger' }),
      this.createSchema({ schema: 'topology' }),
      this.createExtension({ schema: 'public', extension: 'fuzzystrmatch' }),
      this.createExtension({ schema: 'tiger', extension: 'postgis_tiger_geocoder' }),
      this.createExtension({ schema: 'topology', extension: 'postgis_topology' }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'spatial_ref_sys',
        columns: [
          col('auth_name', 'character varying(256)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 256 } },
          }),
          col('auth_srid', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('proj4text', 'character varying(2048)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 2048 } },
          }),
          col('srid', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('srtext', 'character varying(2048)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 2048 } },
          }),
        ],
        constraints: [
          primaryKey(['srid'], { name: 'spatial_ref_sys_pkey' }),
          checkExpression('spatial_ref_sys_srid_check', sql`((srid > 0) AND (srid <= 998999))`),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
