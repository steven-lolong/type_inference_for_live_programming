/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview getFunctionName
 */

// block type: 1 = variable, 2 = function, 3 = parameter, 4 = expBound, 5 = field
export function getName(srcBlock, blockType) {
  let idBlock;
  if (srcBlock) {
    if (blockType == 1 || blockType == 2 || blockType == 5) {
      idBlock = srcBlock.getInputTargetBlock("inputId");
    }

    if (blockType == 3) {
      if (srcBlock.itemCount_ > 0) {
        idBlock = srcBlock.getInputTargetBlock("ADD0");
      }
    }

    if (blockType == 4) {
      idBlock = srcBlock.getInputTargetBlock("uidBlock");
    }

    if (idBlock && idBlock.getFieldValue("identity").length !== 0) {
      return idBlock.getFieldValue("identity");
    }
  }
  return "";
}

export function getFunctionName(srcLambdaBlock) {
  let functionName = "";
  // build function name
  if (srcLambdaBlock.type == "BlockDecFunction") {
    functionName = getName(srcLambdaBlock, 2);
  } else if ((srcLambdaBlock.type = "BlockExpLambda")) {
    let lambdaParentBlock = srcLambdaBlock.getParent();
    if (lambdaParentBlock) {
      if (
        lambdaParentBlock.type == "BlockDecVariable" &&
        getName(lambdaParentBlock, 1).length !== 0
      ) {
        functionName = getName(lambdaParentBlock, 1);
      } else {
        functionName = crypto.getRandomValues(new Uint32Array(4)).join("-");
      }
    } else {
      functionName = crypto.getRandomValues(new Uint32Array(4)).join("-");
    }
  }
  return functionName;
}
