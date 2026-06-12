/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview bottomUpEnumeration
 */
import { getColorByType } from "../color_definitions";
import { formattingComment } from "../formatting_comment";

export function bottomUpEnumeration(childBlock) {
  let parentBlock = childBlock.getParent();
  let parentType = "";
  while (parentBlock) {
    let updateBlockVisually = false;
    parentType = parentBlock.type;
    if (parentType != true) {
      if (parentType == "BlockDecVariable") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockDecFunction") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpLambda") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockDecVariable") {
        updateBlockVisually = true;
      }
      if (parentType.substring(0, 13) == "BlockOperator") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpLetIn") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpSequence") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpApplication") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpIfElse") {
        updateBlockVisually = true;
      }
      if (parentType == "BlockExpListConstructor") {
        updateBlockVisually = true;
      }
    }

    // update the visual information of the block
    if (updateBlockVisually) {
      parentBlock.setColour(getColorByType(parentBlock.termType));
      parentBlock.setCommentText(
        formattingComment(parentBlock.syntaxType, parentBlock.termType, parentBlock.termValue)
      );
    }

    parentBlock = parentBlock.getParent();
  }
}
