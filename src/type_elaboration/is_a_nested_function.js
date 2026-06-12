/* @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Check whether the srcBlock is a nested functions
 */

export function isANestedFunction(srcBlock) {
  let parentBlock = srcBlock.getParent();
  while (parentBlock) {
    if (
      parentBlock.type == "BlockDecFunction" ||
      parentBlock.type == "BlockExpLambda"
    ) {
      let funcBodyBlock = parentBlock.getInputTargetBlock("inputExp");
      if (funcBodyBlock) {
        let allChild = funcBodyBlock.getDescendants();
        if (allChild) {
          for (let i = 0; i < allChild.length; i++) {
            if (allChild[i].id == srcBlock.id) {
              return true;
            }
          }
        }
      }
    }
    parentBlock = parentBlock.getParent();
  }
  return false;
}
