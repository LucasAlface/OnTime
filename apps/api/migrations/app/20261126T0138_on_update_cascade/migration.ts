#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a33ea7e7020b20354710208634465d84695e481585baf487d5d92de920fcba4f/contract';
import startContract from '../../snapshots/a33ea7e7020b20354710208634465d84695e481585baf487d5d92de920fcba4f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f5bc59b1ff1fef9ca061f273b78c311950185099fae7ed4c768eb14f61d661ba/contract';
import endContract from '../../snapshots/f5bc59b1ff1fef9ca061f273b78c311950185099fae7ed4c768eb14f61d661ba/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'RouteStop',
        constraint: 'RouteStop_routeLine_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'RouteStop',
        constraint: 'RouteStop_stopCode_fkey',
        kind: 'foreignKey',
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RouteStop',
        foreignKey: {
          name: 'RouteStop_routeLine_fkey',
          columns: ['routeLine'],
          references: { schema: 'public', table: 'Route', columns: ['line'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
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
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
