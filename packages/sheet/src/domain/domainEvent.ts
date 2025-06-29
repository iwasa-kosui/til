import type { ResultAsync } from 'neverthrow';
import { randomUUID } from 'node:crypto';
import type { AnyAggregate } from './aggregate.js';

export type DomainEvent<TEventName, TPayload, TAggregate extends AnyAggregate> = Readonly<{
  eventId: string;
  eventAt: Date;
  eventName: TEventName;
  payload: TPayload;
  aggregate: TAggregate;
}>;

export type DomainEventStore<TDomainEvent> = TDomainEvent extends
  DomainEvent<infer TEventName, infer TPayload, infer TAggregate> ? Readonly<{
    store: (event: DomainEvent<TEventName, TPayload, TAggregate>) => ResultAsync<void, never>;
  }>
  : never;

const from = <TEventName, TPayload, TAggregate extends AnyAggregate>(
  eventName: TEventName,
  payload: TPayload,
  aggregate: TAggregate,
): DomainEvent<TEventName, TPayload, TAggregate> => ({
  eventId: randomUUID(),
  eventAt: new Date(),
  eventName,
  payload,
  aggregate,
});

export const DomainEvent = {
  from,
} as const;
