import { Pool } from 'pg';
import { Kysely, PostgresDialect } from "kysely"
import type { DB } from '../db';
import { Module } from '@nestjs/common';

const ClientProvider = {
  provide: 'CLIENT',
  useFactory: () => {
    const dialect = new PostgresDialect({
      pool: new Pool({
        database: 'test',
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        port: 5432,
        max: 10,
      }),
    });
    return new Kysely<DB>({
      dialect,
    })
  }
}

export class KyselyService {
  static provider = {
    provide: KyselyService,
    useFactory: () => {
      return KyselyService.fromEnv();
    },
  }

  client: Kysely<DB>;

  constructor(client: Kysely<DB>) {
    this.client = client;
  }

  static fromEnv() {
    const dialect = new PostgresDialect({
      pool: new Pool({
        database: 'test',
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        port: 5432,
        max: 10,
      }),
    });
    const client = new Kysely<DB>({
      dialect,
    });
    return new KyselyService(client);
  }
}