import { IFact, IFactFields } from "../Fact";
import { getFactField, IList } from "../util";
import { alphaMemoryNodeActivation, IAlphaMemoryNode } from "./AlphaMemoryNode";
import { IReteNode } from "./ReteNode";

export interface IConstantTestNode extends IReteNode {
  fieldToTest: IFactFields | "no-test";
  fieldMustEqual: any;
  outputMemory: IAlphaMemoryNode | null;
  children: IList<IConstantTestNode>;
}

export interface IRootConstantTestNode extends IConstantTestNode {
  fieldToTest: "no-test";
}

export function makeConstantTestNode(
  fieldToTest: IFactFields | "no-test",
  fieldMustEqual?: any,
  outputMemory?: IAlphaMemoryNode | null,
  children?: IList<IConstantTestNode>,
): IConstantTestNode {
  const ct: IConstantTestNode = Object.create(null);

  ct.fieldToTest = fieldToTest;
  ct.fieldMustEqual = fieldMustEqual || null;
  ct.outputMemory = outputMemory || null;
  ct.children = children || null;

  return ct;
}

export function makeRootConstantTestNode(): IRootConstantTestNode {
  return makeConstantTestNode("no-test") as IRootConstantTestNode;
}

export function constantTestNodeActivation(
  node: IConstantTestNode,
  f: IFact,
): void {
  if (node.fieldToTest === "no-test") {
    return;
  }

  const v = getFactField(f, node.fieldToTest);

  if (v !== node.fieldMustEqual) {
    return;
  }

  if (node.outputMemory) {
    alphaMemoryNodeActivation(node.outputMemory, f);
  }

  if (node.children) {
    for (const c of node.children) {
      constantTestNodeActivation(c, f);
    }
  }
}

export function buildOrShareConstantTestNode(
  parent: IConstantTestNode,
  f: IFactFields,
  sym: any,
): IConstantTestNode {
  if (parent.children) {
    for (const child of parent.children) {
      if (child.fieldToTest === f && child.fieldMustEqual === sym) {
        return child;
      }
    }
  }

  return makeConstantTestNode(f, sym);
}
