/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview update the type of nested function
 */

import { getFunctionName } from "../get_function_name";

export function updateNestedFunctionType(lambdaBlock, newLambdaEnv) {
  let funcBody = lambdaBlock.getInputTargetBlock("inputExp");
  let allChild = funcBody ? funcBody.getDescendants() : null;

  if (allChild) {
    for (let i = 0; i < allChild.length; i++) {
      if (allChild[i].type == "BlockDecFunction") {
        let varName = getFunctionName(allChild[i]);
        if (varName in newLambdaEnv) {
          allChild[i].termType = newLambdaEnv[varName];
          allChild[i].setColour(getColorByType(allChild[i].termType));
          allChild[i].setCommentText(
            formattingComment(allChild[i].syntaxType, allChild[i].termType, allChild[i].termValue)
          );
        }
      }
      if (allChild[i].type == "BlockExpLambda") {
        if (allChild[i].tempLambdaName in newLambdaEnv) {
          allChild[i].termType = newLambdaEnv[varName];
          allChild[i].setColour(getColorByType(allChild[i].termType));
          allChild[i].setCommentText(
            formattingComment(allChild[i].syntaxType, allChild[i].termType, allChild[i].termValue)
          );
        }
      }
    }
  }
}
