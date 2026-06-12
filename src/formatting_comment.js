/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview
 */

import { prettyPrintSyntaxType } from "./pretty_print_syntax_type";
import { prettyPrintTermType } from "./pretty_print_term_type";
import { prettyPrintTermValue } from "./pretty_print_term_value";

export function formattingComment(grammarType, expressionType, expressionValue) {
  const expressionType_ = Object.assign({}, expressionType);
  const theVal = prettyPrintTermValue(expressionType_, expressionValue);
  const theGrammarType = prettyPrintSyntaxType(grammarType);
  const theExpressionType = prettyPrintTermType(expressionType_);
  let comment =
    "The " +
    theGrammarType +
    " block \ntype: \n" +
    theExpressionType +
    "\n" + "value: \n" + theVal;

  return comment;
}
