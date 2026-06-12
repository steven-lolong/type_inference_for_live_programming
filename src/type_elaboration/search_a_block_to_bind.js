/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Search a block to bind
 */

import { getName } from "../get_function_name";

export function searchABlockToBind(expBoundBlock) {
  let parentBlock = expBoundBlock.getParent();
  let boundId = getName(expBoundBlock, 4);
  let parentType = "";
  let parentId = "";

  while (parentBlock) {
    parentType = parentBlock.type;

    switch (parentType) {
      case "BlockDecVariable": {
        parentId = getName(parentBlock, 1);
        if (parentId == boundId) {
          let isThisChild = false;
          let parentExpBlock = parentBlock.getInputTargetBlock("inputExp");
          let allChild = parentExpBlock
            ? parentExpBlock.getDescendants()
            : null;
          if (allChild) {
            for (let i = 0; i < allChild.length; i++) {
              if (allChild[i].id == expBoundBlock.id) {
                let nestedParent = allChild[i].getParent();
                // checking circularity elaboration
                if (nestedParent) {
                  if (nestedParent.type == "BlockExpApplication") {
                    if (
                      nestedParent.getInputTargetBlock("exp1") &&
                      nestedParent.getInputTargetBlock("exp1").id ==
                      expBoundBlock.id
                    ) {
                      isThisChild = true;
                    }
                  }
                }
              }
            }
          }
          if (isThisChild) {
            expBoundBlock.errorText += "- Error! circular elaboration.\n";
            expBoundBlock.termTypeHasNoError &&= false;
            expBoundBlock.parentST = "";
          } else {
            expBoundBlock.termType = Object.assign({}, parentBlock.termType);
            const newTermValue = JSON.stringify({ 'termValue': parentBlock.termValue });
            expBoundBlock.termValue = JSON.parse(newTermValue).termValue;
            expBoundBlock.boundedSourceID = parentBlock.id;
            expBoundBlock.parentST = "Dec";
          }
          return true;
        }
        expBoundBlock.parentST = "";
        break;
      }
      case "BlockDecFunction": {
        parentId = getName(parentBlock, 2);
        if (parentId == boundId) {
          expBoundBlock.termType = Object.assign({}, parentBlock.termType);
          const newTermValue = JSON.stringify({ 'termValue': parentBlock.termValue });
          expBoundBlock.termValue = JSON.parse(newTermValue).termValue;
          // expBoundBlock.termType = parentBlock.termType;
          expBoundBlock.boundedSourceID = parentBlock.id;
          expBoundBlock.parentST = "Dec";
          return true;
        } else {
          let funChild = parentBlock.getInputTargetBlock("inputExp");
          let allChilds = funChild ? funChild.getDescendants() : null;
          if (allChilds) {
            for (let i = 0; i < allChilds.length; i++) {
              if (allChilds[i].id == expBoundBlock.id) {
                let paramBlock = parentBlock.getInputTargetBlock("inputParam");
                let paramId = paramBlock ? getName(paramBlock, 3) : "";
                if (paramId == boundId) {
                  expBoundBlock.termType = Object.assign({}, paramBlock.termType);
                  const newTermValue = JSON.stringify({ 'termValue': paramBlock.termValue });
                  expBoundBlock.termValue = JSON.parse(newTermValue).termValue;
                  // expBoundBlock.termType = paramBlock.termType;
                  expBoundBlock.boundedSourceID = paramBlock.id;
                  expBoundBlock.parentST = "Param";
                  return true;
                }
              }
            }
          }
        }
        expBoundBlock.parentST = "";
        break;
      }
      case "BlockExpLambda": {
        let lambdaChild = parentBlock.getInputTargetBlock("inputExp");
        let allLambdaChilds = lambdaChild ? lambdaChild.getDescendants() : null;
        if (allLambdaChilds) {
          for (let i = 0; i < allLambdaChilds.length; i++) {
            if (allLambdaChilds[i].id == expBoundBlock.id) {
              let paramBlock = parentBlock.getInputTargetBlock("inputParam");
              let paramId = paramBlock ? getName(paramBlock, 3) : "";
              if (paramId == boundId) {
                expBoundBlock.termType = Object.assign({}, paramBlock.termType);
                const newTermValue = JSON.stringify({ 'termValue': paramBlock.termValue });
                expBoundBlock.termValue = JSON.parse(newTermValue).termValue;
                // expBoundBlock.termType = paramBlock.termType;
                expBoundBlock.boundedSourceID = paramBlock.id;
                expBoundBlock.parentST = "Param";
                return true;
              }
            }
          }
        }
        expBoundBlock.parentST = "";
        break;
      }
      case "BlockExpLetIn": {
        for (let i = 0; i < parentBlock.itemCount_; i++) {
          let bodyInBlock = parentBlock.getInputTargetBlock("ADD" + i);
          let internalChilds = bodyInBlock
            ? bodyInBlock.getDescendants()
            : null;
          if (internalChilds) {
            for (let j = 0; j < internalChilds.length; j++) {
              if (internalChilds[j].id == expBoundBlock.id) {
                let letDecBlock =
                  parentBlock.getInputTargetBlock("declaration");
                while (letDecBlock) {
                  let letDecBlockId = getName(letDecBlock, 1); //function or declaration;
                  if (letDecBlockId == boundId) {
                    expBoundBlock.termType = Object.assign({}, letDecBlock.termType);
                    const newTermValue = JSON.stringify({ 'termValue': letDecBlock.termValue });
                    expBoundBlock.termValue = JSON.parse(newTermValue).termValue;
                    // expBoundBlock.termType = letDecBlock.termType;
                    expBoundBlock.boundedSourceID = letDecBlock.id;
                    expBoundBlock.parentST = "Dec";
                    return true;
                  }
                  letDecBlock = letDecBlock.getNextBlock();
                }
              }
            }
          }
        }
        expBoundBlock.parentST = "";
        break;
      }
      default: {
        expBoundBlock.parentST = "";
        break;
      }
    }

    parentBlock = parentBlock.getParent();
  }
  return false;
}
