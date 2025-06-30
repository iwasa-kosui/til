import type { Aggregate } from "./aggregate.js";
import { DomainEvent } from "./domainEvent.js";
import  { OrgUnitCode } from "./orgUnitCode.js";
import  { OrgUnitId } from "./orgUnitId.js"

export type OrgUnit = Readonly<{
  orgUnitId: OrgUnitId;
  orgUnitCode: OrgUnitCode;
  name: string;
}>

type OrgUnitAggregate = Aggregate<OrgUnitId, OrgUnit>;

const aggregate = (orgUnit: OrgUnit): OrgUnitAggregate => ({
  id: orgUnit.orgUnitId,
  state: orgUnit,
});

export type OrgUnitEvent<TEventName, TPayload> = DomainEvent<
  TEventName,
  TPayload,
  OrgUnitAggregate
>

export type OrgUnitCreated = OrgUnitEvent<
  "OrgUnitCreated",
  {
    orgUnitCode: OrgUnitCode;
    name: string;
  }
  >;

const create = (
  orgUnitCode: OrgUnitCode,
  name: string,
): OrgUnitCreated => {
  const orgUnitId = OrgUnitId.generate();
  return  DomainEvent.from('OrgUnitCreated', {
    orgUnitCode,
    name,
  }, aggregate({
    orgUnitId,
    orgUnitCode,  
    name,
  }));
}

export const OrgUnit = {
  aggregate,
  create,
} as const;
