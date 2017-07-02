// // if node is a join:
// //   remove node from node.alphaMemory.successors
// //   if node.alphaMemory.successors is now empty, clean it up.
// // else:
// //   for node.items, `item.delete()`
// // remove node from node.parent.children
// // if node.parent.children is now empty, `deleteNodeAndAnyUnusedAncestors(node.parent)`
// type deleteNodeAndAnyUnusedAncestors = (node: IReteNode) => void;

// interface IRoot {
//   // currentNode = new DummyNode
//   // earlierConditions = []
//   //
//   // c1 = conditions[0]
//   // tests = joinTestsFromCondition(c1, earlierConditions)
//   // alphaMemory = buildOrShareAlphaMemory(c1)
//   // currentNode = buildOrShareJoinNode(currentNode, alphaMemory, tests)
//   //
//   // for i of conditions[1] -> conditions[end]
//   //   currentNode = buildOrShareBetaMemoryNode(currentNode)
//   //   earlierConditions.unshift(conditions[i-1])
//   //   tests = joinTestsFromCondition(conditions[i], earlierConditions)
//   //   alphaMemory = buildOrShareAlphaMemory(conditions[i])
//   //   currentNode = buildOrShareJoinNode(currentNode, alphaMemory, tests)
//   //
//   // pNode = new PNode()
//   // pNode.parent = currentNode
//   // currentNode.children = pNode
//   // updateNewNodeWithMatchesFromAbove(currentNode, alphaMemory, tests)
//   //
//   // rule = new Rule()
//   // rule.pNode = pNode;
//   // rule.conditions = conditions;
//   // pNode.rule = rule;
//   // return rule
//   addRule: (conditions: ICondition[]) => IRule;

//   // deleteNodeAndAnyUnusedAncestors(r.pNode)
//   removeRule: (r: IRule) => void;
// }

// interface IRule {
//   conditions: ICondition[];
//   pNode: IPNode;
// }

// interface IPNode extends IReteNode {
//   type: "p-node";
//   parent: IReteNode;
//   rule: IRule;

//   // Executes rule callbacks.
//   leftActivation: (t: IToken) => void;
// }
