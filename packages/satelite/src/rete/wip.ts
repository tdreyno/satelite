// // if node is a join:
// //   remove node from node.alphaMemory.successors
// //   if node.alphaMemory.successors is now empty, clean it up.
// // else:
// //   for node.items, `item.delete()`
// // remove node from node.parent.children
// // if node.parent.children is now empty, `deleteNodeAndAnyUnusedAncestors(node.parent)`
// type deleteNodeAndAnyUnusedAncestors = (node: IReteNode) => void;
