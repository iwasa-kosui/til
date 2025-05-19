import { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface ArticleTable {
  id: string;
  title: string;
  content: string;
}

export interface DomainEventTable {
  event_id: string;
  event_at: Timestamp;
  event_name: string;
  payload: Record<string, unknown>;
  aggregate: Record<string, unknown>;
}

export interface DB {
  article: ArticleTable;
  domain_event: DomainEventTable;
}
