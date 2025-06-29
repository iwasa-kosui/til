import type { OrgTreeId } from "./orgTreeId.js";
import type { OrgUnitId } from "./orgUnitId.js"

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

const add = (
  parent: OrgUnitId,
  child: OrgUnitId,
) => (orgTree: OrgTree): OrgTree => {
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

  return {
    ...orgTree,
    closures: [
      ...orgTree.closures,
      ...childAncestorClosures,
      childSelfClosure,
    ],
  };
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
  findAncestors,
  findDescendants,
  findChildren,
  findParent,
  add,
  removeWithDescendants,
} as const
