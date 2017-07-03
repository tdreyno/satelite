import { IFact } from "../Fact";
import { IToken, makeToken } from "../Token";
import {
  addToListHead,
  IList,
  removeFromList,
  runLeftActivationOnNode,
} from "../util";
import { INegatedConjunctiveConditionsPartnerNode } from "./NegatedConjunctiveConditionsPartnerNode";
import { IReteNode } from "./ReteNode";

export interface INegatedConjunctiveConditionsNode extends IReteNode {
  type: "ncc";
  items: IList<IToken>;
  partner: INegatedConjunctiveConditionsPartnerNode;
}

export function negatedConjunctiveConditionsNodeLeftActivation(
  node: INegatedConjunctiveConditionsNode,
  t: IToken,
  f: IFact | null,
): void {
  const newToken = makeToken(node, t, f);

  node.items = addToListHead(node.items, newToken);

  if (node.partner.newResultsBuffer) {
    const buffer = node.partner.newResultsBuffer;
    for (const result of buffer) {
      node.partner.newResultsBuffer = removeFromList(
        node.partner.newResultsBuffer,
        result,
      );
      newToken.nccResults = addToListHead(newToken.nccResults, result);
      result.owner = newToken;
    }
  }

  if (!newToken.nccResults) {
    if (node.children) {
      for (const child of node.children) {
        runLeftActivationOnNode(child, newToken, null);
      }
    }
  }
}