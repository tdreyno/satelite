// // parent = newNode.parent
// // if parent.type is `beta-memory`:
// //   for each token in `parent.items`, run `leftActivation(newNode, token)
// // if parent.type is `join`:
// //   oldChildren = parent.children
// //   parent.children = [newNode]
// //   for each item in `parent.alphaMemory`, run `rightActivation(parent, item.fact)`
// //   parent.children = oldChildren
// type updateNewNodeWithMatchesFromAbove = (newNode: IReteNode) => void;

// // For each parent.children,
// //   if child is a JoinNode,
// //   and `child.alphaMemory` == `alphaMemory`
// //   and `child.tests` == `tests`,
// //     return it.
// //
// // Otherwie, create a JoinNode.
// //   newNode.parent = parent
// //   Add `newNode` to `parent.children`.
// //   newNode.tests = tests
// //   newNode.alphaMemory = alphaMemory
// //
// //   Add `newNode` to `alphaMemory.successors`.
// type buildOrShareJoinNode = (
//   parent: IReteNode,
//   alphaMemory: IAlphaMemoryNode,
//   tests: ITestAtJoinNode[],
// ) => IReteNode;

// // result = []
// // for each variable in `c` (the current condition)
// //   find the last condition in `earlierConditions` where the variable exists:
// //     Create new test:
// //       fieldOfArg1: position of variable in c.
// //       conditionNumberOfArg2: the index of the condition where the var was discovered
// //       fieldOfArg2: position of variable in discovered condition.
// // return the collected tests
// type joinTestsFromCondition = (
//   c: ICondition,
//   earlierConditions: ICondition[],
// ) => ITestAtJoinNode[];

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
