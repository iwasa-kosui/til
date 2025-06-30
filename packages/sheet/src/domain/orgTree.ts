import { ok, type Result } from "neverthrow";
import type { Aggregate } from "./aggregate.js";
import { DomainEvent } from "./domainEvent.js";
import { OrgTreeId } from "./orgTreeId.js";
import { OrgUnitId } from "./orgUnitId.js"

type Closure = Readonly<{
  ancestor: OrgUnitId;
  descendant: OrgUnitId;
  depth: number;
}>

export type OrgTree = Readonly<{
  orgTreeId: OrgTreeId;
  root: OrgUnitId;
  closures: ReadonlyArray<Closure>;
}>

type OrgTreeAggregate = Aggregate<OrgTreeId, OrgTree>;
const aggregate = (orgTree: OrgTree): OrgTreeAggregate => ({
  id: orgTree.orgTreeId,
  state: orgTree,
});

type OrgTreeEventOf<TEventName, TPayload> = DomainEvent<
  TEventName,
  TPayload,
  OrgTreeAggregate
>
type OrgTreeCreated = OrgTreeEventOf<
  "OrgTreeCreated",
  {
    root: OrgUnitId;
  }
>
type OrgTreeAdded = OrgTreeEventOf<
  "OrgTreeAdded",
  {
    parent: OrgUnitId;
    child: OrgUnitId;
  }
>
type OrgTreeRemoved = OrgTreeEventOf<
  "OrgTreeRemoved",
  {
    orgUnitId: OrgUnitId;
  }
>
export type OrgTreeEvent =
  | OrgTreeCreated
  | OrgTreeAdded
  | OrgTreeRemoved;

type State = Readonly<{
  orgTree: OrgTree;
  events: ReadonlyArray<OrgTreeEvent>;
}>
type Acc<E> = (v: OrgTree) => Result<OrgTreeEvent, E>;

const newState = (event: OrgTreeEvent): State => ({
  orgTree: event.aggregate.state,
  events: [event],
});

const reduceState = <E>(acc: Acc<E>) => (state: State) => 
  acc(state.orgTree)
    .map(event => ({
      orgTree: event.aggregate.state,
      events: [...state.events, event],
    }))


const findAncestors = (
  child: OrgUnitId,
) => (orgTree: OrgTree): ReadonlyArray<Closure> => {
  return orgTree.closures
    .filter((closure) => closure.descendant === child)
}

const findDescendants = (
  parent: OrgUnitId,
) => (orgTree: OrgTree): ReadonlyArray<Closure> => {
  return orgTree.closures
    .filter((closure) => closure.ancestor === parent)
}

const findChildren = (
  parent: OrgUnitId,
) => (orgTree: OrgTree): ReadonlyArray<OrgUnitId> => {
  return orgTree.closures
    .filter((closure) => closure.ancestor === parent && closure.depth === 1)
    .map((closure) => closure.descendant);
}

const findParent = (
  child: OrgUnitId,
) => (orgTree: OrgTree): OrgUnitId | undefined => {
  const closure = orgTree.closures.find(
    (closure) => closure.descendant === child && closure.depth === 1,
  );
  return closure ? closure.ancestor : undefined;
}

const create = (
  root: OrgUnitId,
): Result<OrgTreeCreated, never> => {
  const orgTreeId = OrgTreeId.generate();
  const event = DomainEvent.from('OrgTreeCreated' as const, {
    root,
  }, aggregate({
    orgTreeId,
    root,
    closures: [{
      ancestor: root,
      descendant: root,
      depth: 0,
    }],
  }));
  return ok(event);
}

const add = (
  parent: OrgUnitId,
  child: OrgUnitId,
) => (orgTree: OrgTree): Result<OrgTreeAdded, never> => {
  const closuresOfParent = findAncestors(parent)(orgTree);
  const childAncestorClosures = closuresOfParent.map(
    (closure): Closure => ({
      ancestor: closure.ancestor,
      descendant: child,
      depth: closure.depth + 1,
    }),
  );
  const childSelfClosure = {
    ancestor: child,
    descendant: child,
    depth: 0,
  } as const satisfies Closure;

  const newOrgTree = {
    ...orgTree,
    closures: [
      ...orgTree.closures,
      ...childAncestorClosures,
      childSelfClosure,
    ],
  };
  return ok(
    DomainEvent.from('OrgTreeAdded' as const, {
      parent,
      child,
    }, aggregate(newOrgTree)),
  )
}

const removeWithDescendants = (
  orgUnitId: OrgUnitId,
) => (orgTree: OrgTree): OrgTree => {
  const toRemove = findDescendants(orgUnitId)(orgTree).map(x => x.descendant);
  const closuresToKeep = orgTree.closures.filter(
    (closure) => !(toRemove.some(x => x === closure.ancestor))
  )
  return {
    ...orgTree,
    closures: closuresToKeep,
  };
}

export const OrgTree = {
  new: (orgRoot: OrgUnitId): OrgTree => ({
    orgTreeId: OrgTreeId.generate(),
    root: orgRoot,
    closures: [{
      ancestor: orgRoot,
      descendant: orgRoot,
      depth: 0,
    }],
  }),
  create,
  findAncestors,
  findDescendants,
  findChildren,
  findParent,
  add,
  removeWithDescendants,
  newState,
  reduceState,
} as const
