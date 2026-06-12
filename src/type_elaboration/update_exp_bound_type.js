/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview updateExpBoundType
 */

import { bottomUpEnumeration } from "./bottom_up_enumeration";

export function updateExpBoundType(lambdaBlock) {
  let funcBody = lambdaBlock.getInputTargetBlock("inputExp");
  let allChild = funcBody ? funcBody.getDescendants() : null;

  if (allChild) {
    for (let i = 0; i < allChild.length; i++) {
      if (allChild[i].type == "BlockExpBound") {
        allChild[i].onchange();
        bottomUpEnumeration(allChild[i]);
      }
    }
  }
}
