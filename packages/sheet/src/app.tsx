import { Hono } from "hono";
import { OrgChart } from "./view/OrgChart.js";
import { OrgTree, type OrgTreeEvent } from "./domain/orgTree.js";
import { OrgUnit } from "./domain/orgUnit.js";
import { OrgUnitCode } from "./domain/orgUnitCode.js";
import { OrgTreeId } from "./domain/orgTreeId.js";
import { ok } from "neverthrow";
import type { AnyAggregate } from "./domain/aggregate.js";
import type { DomainEvent } from "./domain/domainEvent.js";

const app = new Hono();


const ExampleOrgUnit = {
  create: (orgUnitCode: string, name: string): OrgUnit => 
    OrgUnit.create(
      OrgUnitCode.unsafeParse(orgUnitCode),
      name
    ).aggregate.state
} as const

const hq = ExampleOrgUnit.create(
  "HQ",
  "本社"
);
const dev = ExampleOrgUnit.create(
  "DEV",
  "開発部"
);
const sales = ExampleOrgUnit.create(
  "SALES",
  "営業部"
);
const hr = ExampleOrgUnit.create(
  "HR",
  "人事部"
);
const dev1 = ExampleOrgUnit.create(
  "DEV-1",
  "開発1課"
);
const dev2 = ExampleOrgUnit.create(
  "DEV-2",
  "開発2課"
);

const exampleOrgUnits = [
  hq,
  dev,
  sales,
  hr,
  dev1,
  dev2,
] as const;


const exampleOrgTree =
  OrgTree.create(hq.orgUnitId)
  .map(OrgTree.newState)
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, dev.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, sales.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, hr.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(dev.orgUnitId, dev1.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(dev.orgUnitId, dev2.orgUnitId)))
  ._unsafeUnwrap()
  .orgTree;

  console.log(OrgTree.create(hq.orgUnitId)
  .map(OrgTree.newState)
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, dev.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, sales.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(hq.orgUnitId, hr.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(dev.orgUnitId, dev1.orgUnitId)))
  .andThen(OrgTree.reduceState(OrgTree.add(dev.orgUnitId, dev2.orgUnitId)))
  ._unsafeUnwrap().events)

app.get("/example", (c) => {
  return c.html(<OrgChart orgUnits={exampleOrgUnits} orgTree={exampleOrgTree} />);
});

export default app;

