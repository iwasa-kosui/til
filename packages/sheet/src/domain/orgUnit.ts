import type { Aggregate } from "./aggregate.js";
import type { DomainEvent } from "./domainEvent.js";
import type { OrgUnitCode } from "./orgUnitCode.js";
import type { OrgUnitId } from "./orgUnitId.js"

export type OrgUnit = Readonly<{
  orgUnitId: OrgUnitId;
  orgUnitCode: OrgUnitCode;
  name: string;
}>

type OrgUnitAggregate = Aggregate<OrgUnitId, OrgUnit>;

const aggregate = (orgUnit: OrgUnit): OrgUnitAggregate => ({
  id: orgUnit.orgUnitId,
  orgUnitId: orgUnit.orgUnitId,
  orgUnitCode: orgUnit.orgUnitCode,
  name: orgUnit.name,
});

export type OrgUnitEvent<TEventName, TPayload> = DomainEvent<
  TEventName,
  TPayload,
  OrgUnitAggregate
>

export const OrgUnit = {
  aggregate,
} as const;