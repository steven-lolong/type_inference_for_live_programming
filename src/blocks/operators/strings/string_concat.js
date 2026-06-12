/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression String Operator - concatenate two string
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockOperatorStringConcatenate"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "primitive", value: "string" };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedLhs = { key: "primitive", value: "string" };
    this.expectedRhs = { key: "primitive", value: "string" };

    this.appendValueInput("lhs")
      .setCheck("exp")
      .appendField("Concatenate string")
      .appendField(new MnLFieldColor(getColorByType(this.expectedLhs), null, {}), "lhs_term_type_color");
    this.appendValueInput("rhs").setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(new MnLFieldColor(getColorByType(this.expectedRhs), null, {}), "rhs_term_type_color");
    this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setTooltip("Primitive string operator - concatenate");
    this.setHelpUrl("");

    this.setWarningText(null);
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  onchange: function () {

    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.termValue = undefined;

    this.errorText = "";

    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBloctTermTypeChecker();

        if (this.errorText.length === 0) {
          this.evaluator();
        }

      }
    }

    this.getField('lhs_term_type_color').setTooltip(prettyPrintTermType(this.expectedLhs));
    this.getField('rhs_term_type_color').setTooltip(prettyPrintTermType(this.expectedRhs));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    let lhsValue = lhsBlock ? lhsBlock.termValue : undefined;
    let rhsValue = rhsBlock ? rhsBlock.termValue : undefined;

    if (typeof lhsValue === 'string' && typeof rhsValue === 'string') {
      this.termValue = (lhsValue + rhsValue);
    }
  },

  evaluatorVisualization: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    let lhsValue = lhsBlock ? lhsBlock.termValue : undefined;
    let rhsValue = rhsBlock ? rhsBlock.termValue : undefined;

    if (typeof lhsValue === 'string' && typeof rhsValue === 'string') {
      this.termValue = (lhsValue + rhsValue);
    }
  },

  evaluatorVisualizationCBV: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    let lhsValue = lhsBlock ? lhsBlock.termValue : undefined;
    let rhsValue = rhsBlock ? rhsBlock.termValue : undefined;

    if (typeof lhsValue === 'string' && typeof rhsValue === 'string') {
      this.termValue = (lhsValue + rhsValue);
    }
  },

  isNoErrorOnTermTypeOfChild: function () {
    let noTermTypeError = true;
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    if (!lhsBlock.termTypeHasNoError) {
      this.errorText += "- The connected block on LHS has a term type error.\n";
      noTermTypeError &&= false;
    }

    if (!rhsBlock.termTypeHasNoError) {
      this.errorText += "- The connected block on RHS has a term type error.\n";
      noTermTypeError &&= false;
    }

    return noTermTypeError;
  },

  inputBloctTermTypeChecker: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    if (lhsBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedLhs, lhsBlock.termType)) {
        this.termTypeHasNoError &&= false;
        let formatErrorLhs =
          "- Expected term type on LHS: " +
          prettyPrintTermType(this.expectedLhs) +
          ", but found: " +
          prettyPrintTermType(lhsBlock.termType) +
          ".\n";
        this.errorText += formatErrorLhs;
      }
    } else {
      let formatErrorLhs =
        "- Expected term type on LHS: " +
        prettyPrintTermType(this.expectedLhs) +
        ", but found: " +
        prettyPrintTermType(lhsBlock.termType) +
        ".\n";
      this.errorText += formatErrorLhs;
    }

    if (rhsBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedRhs, rhsBlock.termType)) {
        this.termTypeHasNoError &&= false;
        let formatErrorRhs =
          "- Expected term type on RHS: " +
          prettyPrintTermType(this.expectedRhs) +
          ", but found: " +
          prettyPrintTermType(rhsBlock.termType) +
          ".\n";
        this.errorText += formatErrorRhs;
      }
    } else {
      let formatErrorRhs =
        "- Expected term type on RHS: " +
        prettyPrintTermType(this.expectedRhs) +
        ", but found: " +
        prettyPrintTermType(lhsBlock.termType) +
        ".\n";
      this.errorText += formatErrorRhs;
    }
  },

  isCompleteBlock: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    if (!lhsBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block on LHS.\n";
    } else {
      if (!lhsBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block on LHS is incomplete.\n";
      }
    }

    if (!rhsBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block on RHS.\n";
    } else {
      if (!rhsBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block on RHS is incomplete.\n";
      }
    }
  },
};
