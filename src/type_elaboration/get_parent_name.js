/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview get the parent name of the lambda block
 */

import { getName } from "../get_function_name";

export function getParentName(childBlock) {
  let parentBlock = childBlock.getParent();
  let parentName;
  if (parentBlock) {
    if (parentBlock.type == "BlockDecVariable") {
      parentName = getName(parentBlock, 1);
    } else if (
      parentBlock.type == "BlockExpSequence" ||
      parentBlock.type == "BlockExpLetIn"
    ) {
      let lastBlock = parentBlock.getInputTargetBlock(
        "ADD" + (parentBlock.itemCount_ - 1)
      );
      if (lastBlock && lastBlock.id == childBlock.id) {
        parentName = getParentName(parentBlock);
      }
    }
  }
  return parentName;
}
