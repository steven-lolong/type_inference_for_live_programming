/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression List Operator - Append
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { equalityTypeChecker } from "../../../seeders/type_elaboration/equality_type_checker";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockOperatorListAppend"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "list", value: { key: "*", value: "*" } };
    this.termValue = [];

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedLhs = { key: "*", value: "*" };
    this.expectedRhs = { key: "list", value: { key: "*", value: "*" } };

    this.appendValueInput("lhs")
      .setCheck("exp")
      .appendField("Append")
      .appendField(new MnLFieldColor(getColorByType(this.expectedLhs), null, {}), "lhs_term_type_color");
    this.appendValueInput("rhs").setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("to List")
      .appendField(new MnLFieldColor(getColorByType(this.expectedRhs), null, {}), "rhs_term_type_color");
    this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setTooltip("Append item to list");
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
    this.errorText = "";
    this.termType = { key: "list", value: { key: "*", value: "*" } };
    this.termValue = [];


    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBlockTermTypeChecker();
        if (this.termTypeHasNoError) {
          this.constructType();

          if (this.errorText.length === 0) {
            this.evaluator();
          }

        }
      }
    }

    this.updateSuggestionFieldColor();
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
    let rhsValue = rhsBlock ? rhsBlock.termValue : [];
    let new_val = [];
    if (lhsValue !== undefined) { new_val.push(lhsValue); }
    if (rhsValue !== undefined) {
      if (rhsValue.length == 0) {
        this.termValue = new_val;
      } else {
        this.termValue = new_val.concat(rhsValue);
      }

      if (mnlWorkspaceId != this.workspace.id) {
        this.constructType();
      }
    }
    this.updateDisplay();
  },

  evaluatorVisualization: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    let lhsValue = lhsBlock ? lhsBlock.termValue : '';
    let rhsValue = rhsBlock ? rhsBlock.termValue : [];
    let new_val = [];
    if (lhsValue !== undefined) { new_val.push(lhsValue); }
    if (rhsValue !== undefined) {
      if (rhsValue.length == 0) {
        this.termValue = new_val;
      } else {
        this.termValue = new_val.concat(rhsValue);
      }


      if (mnlWorkspaceId != this.workspace.id) {
        this.constructType();
      }
    }
    this.updateDisplay();
  },

  evaluatorVisualizationCBV: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");

    let lhsValue = lhsBlock ? lhsBlock.termValue : '';
    let rhsValue = rhsBlock ? rhsBlock.termValue : [];
    let new_val = [];
    if (lhsValue !== undefined) { new_val.push(lhsValue); }
    if (rhsValue !== undefined) {
      if (rhsValue.length == 0) {
        this.termValue = new_val;
      } else {
        this.termValue = new_val.concat(rhsValue);
      }


      if (mnlWorkspaceId != this.workspace.id) {
        this.constructType();
      }
    }
    this.updateDisplay();
  },

  updateDisplay: function () {
    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  updateSuggestionFieldColor: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");
    let expectedLhs_ = this.expectedLhs;
    let expectedRhs_ = this.expectedRhs;
    if (lhsBlock && !rhsBlock) {
      if (lhsBlock.termType != "unknown") {
        expectedLhs_ = lhsBlock.termType;
        expectedRhs_ = { key: "list", value: expectedLhs_ };
      }
    }
    if (!lhsBlock && rhsBlock) {
      if (rhsBlock.termType.key == "list") {
        expectedLhs_ = rhsBlock.termType.value;
        expectedRhs_ = rhsBlock.termType;
      }
    }
    if (lhsBlock && rhsBlock) {
      if (this.noTermTypeError) {
        expectedLhs_ = this.termType.value;
        expectedRhs_ = this.termType;
      } else {
        if (rhsBlock.termType.key == "list") {
          if (rhsBlock.termType.value.key == "*" && rhsBlock.termType.value.value == "*") {
            expectedLhs_ = lhsBlock.termType;
            expectedRhs_ = { key: "list", value: expectedLhs_ };
          } else {
            expectedLhs_ = rhsBlock.termType.value;
            expectedRhs_ = rhsBlock.termType;
          }

        } else {
          expectedLhs_ = lhsBlock.termType;
          expectedRhs_ = { key: "list", value: expectedLhs_ };
        }
      }
    }

    this.updateFieldColor(expectedLhs_, expectedRhs_);
  },

  updateFieldColor: function (lhsTermType_, rhsTermType_) {
    let lhsField = this.getField("lhs_term_type_color");
    let rhsField = this.getField("rhs_term_type_color");

    lhsField.value_ = getColorByType(lhsTermType_);
    rhsField.value_ = getColorByType(rhsTermType_);
    lhsField.applyColour();
    rhsField.applyColour();
    lhsField.setTooltip(prettyPrintTermType(lhsTermType_));
    rhsField.setTooltip(prettyPrintTermType(rhsTermType_));
  },

  constructType: function () {
    let lhsBlock = this.getInputTargetBlock("lhs");
    let rhsBlock = this.getInputTargetBlock("rhs");
    if (equalityTypeChecker(lhsBlock.termType, rhsBlock.termType.value)) {
      if (rhsBlock.termType.value.key == "*" && rhsBlock.termType.value.value == "*") {
        if (lhsBlock.termType.value != "*") {
          this.termType = {
            key: "list",
            value: lhsBlock.termType
          }
        }
      } else {
        this.termType = rhsBlock.termType;
      }
    } else if (rhsBlock.termType.value.key == "*" && rhsBlock.termType.value.value == "*") {
      // append to empty list 
      if (lhsBlock.termType.value != "*") {
        this.termType = {
          key: "list",
          value: lhsBlock.termType
        }
      }
    } else {
      let termTypeErrorMsg =
        "- The term types on LHS and RHS do not match.\n";
      this.errorText += termTypeErrorMsg;
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

  inputBlockTermTypeChecker: function () {
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
