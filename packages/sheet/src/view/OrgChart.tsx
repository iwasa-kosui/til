
import { html } from "hono/html";
import { OrgTree } from "../domain/orgTree.js";
import type { OrgUnit } from "../domain/orgUnit.js";
import type { OrgUnitId } from "../domain/orgUnitId.js";

type OrgChartNode = OrgUnit & {
  children: OrgChartNode[];
};

const buildHierarchy = (
  orgUnits: ReadonlyArray<OrgUnit>,
  orgTree: OrgTree,
  parentId: OrgUnitId | null,
): OrgChartNode[] => {
  const childrenIds = parentId
    ? OrgTree.findChildren(parentId)(orgTree)
    : [orgTree.root];

  return childrenIds
    .map((id) => {
      const orgUnit = orgUnits.find((u) => u.orgUnitId === id);
      if (!orgUnit) {
        return null;
      }
      return {
        ...orgUnit,
        children: buildHierarchy(orgUnits, orgTree, id),
      };
    })
    .filter((node): node is OrgChartNode => node !== null);
};

const OrgChartNodeComponent = ({ node }: { node: OrgChartNode }) => {
  return html`
    <li>
      <div class="node">
        <div class="name">${node.name}</div>
        <div class="code">${node.orgUnitCode}</div>
      </div>
      ${node.children.length > 0 && html`
        <ul>
          ${node.children.map((child) => <OrgChartNodeComponent node={child} />)}
        </ul>
      `}
    </li>
  `;
};

export const OrgChart = (
  { orgUnits, orgTree }: { orgUnits: ReadonlyArray<OrgUnit>; orgTree: OrgTree },
) => {
  const hierarchicalData = buildHierarchy(orgUnits, orgTree, null);

  return html`
    <style>
      .org-chart ul {
        padding-left: 20px;
        list-style: none;
        border-left: 1px solid #ccc;
      }
      .org-chart li {
        position: relative;
        padding-top: 10px;
      }
      .org-chart li::before {
        content: "";
        position: absolute;
        top: 25px;
        left: -20px;
        width: 20px;
        height: 1px;
        background-color: #ccc;
      }
      .node {
        display: inline-block;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
      }
      .name {
        font-weight: bold;
      }
      .code {
        font-size: 0.9em;
        color: #666;
      }
    </style>
    <div class="org-chart">
      <ul>
        ${hierarchicalData.map((node) => <OrgChartNodeComponent node={node} />)}
      </ul>
    </div>
  `;
};
