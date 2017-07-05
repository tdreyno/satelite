// import { IFact } from "../Fact";
// import { deleteDescendentsOfToken, IToken, makeToken } from "../Token";
// import { addToListHead, IList } from "../util";
// import { INegatedConjunctiveConditionsNode } from "./NegatedConjunctiveConditionsNode";
// import { IReteNode } from "./ReteNode";

// export interface INegatedConjunctiveConditionsPartnerNode extends IReteNode {
//   type: "ncc-partner";
//   nccNode: INegatedConjunctiveConditionsNode;
//   numberOfConjuncts: number;
//   newResultsBuffer: IList<IToken>;
// }

// export function negatedConjunctiveConditionsPartnerNodeLeftActivation(
//   node: INegatedConjunctiveConditionsPartnerNode,
//   t: IToken,
//   f: IFact | null,
// ): void {
//   const nccNode = node.nccNode;

//   const newResult = makeToken(node, t, f);

//   let ownersT: IToken | null = t;
//   let ownersF: IFact | null = f;

//   for (let i = 0; i < node.numberOfConjuncts; i++) {
//     ownersF = ownersT && ownersT.fact;
//     ownersT = ownersT && ownersT.parent;
//   }

//   if (
//     t.owner &&
//     nccNode.items &&
//     nccNode.items.some(
//       i =>
//         typeof i.owner !== "undefined" &&
//         i.owner!.parent === ownersT &&
//         i.owner!.fact === ownersF,
//     )
//   ) {
//     t.owner.nccResults = addToListHead(t.owner.nccResults, newResult);
//     newResult.owner = t.owner;

//     deleteDescendentsOfToken(t.owner);
//   } else {
//     node.newResultsBuffer = addToListHead(node.newResultsBuffer, newResult);
//   }
// }
