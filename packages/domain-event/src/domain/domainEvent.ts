import { randomUUID } from 'node:crypto';
import type { AnyAggregate } from './aggregate.js';

export type DomainEvent<TEventName, TPayload, TAggregate extends AnyAggregate> = Readonly<{
  eventId: string;
  eventAt: Date;
  eventName: TEventName;
  payload: TPayload;
  aggregate: TAggregate;
}>;

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
};
