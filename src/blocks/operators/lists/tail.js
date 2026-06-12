/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression List Operator - Tail
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockOperatorListTail"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "list", value: { key: "*", value: "*" } };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedBlock = { key: "list", value: { key: "*", value: "*" } };

    this.appendValueInput("expBlock")
      .setCheck("exp")
      .appendField("Tail of List")
      .appendField(new MnLFieldColor(getColorByType(this.expectedBlock), null, {}), "expected_term_type_color");
    this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setTooltip("Primitive list operator - tail of list");
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
    this.termValue = undefined;
    let fieldColor = this.getField("expected_term_type_color");
    let childBlock = this.getInputTargetBlock("expBlock");
    if (childBlock) {
      fieldColor.value_ = getColorByType(childBlock.termType);
      fieldColor.setTooltip(prettyPrintTermType(childBlock.termType));
      fieldColor.applyColour();
    } else {
      fieldColor.setTooltip(prettyPrintTermType(this.expectedBlock));
      fieldColor.value_ = getColorByType(this.expectedBlock);
      fieldColor.applyColour();
    }

    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBloctTermTypeChecker();
        this.inferType();

        if (this.errorText.length === 0) {
          this.evaluator();
        }

      }
    }

    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },


  evaluator: function () {
    let expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (expBlock.termType.key == "list") {
        if (expBlock.termValue !== undefined) {
          let new_val = expBlock.termValue.slice(1)
          this.termValue = new_val;
          if (mnlWorkspaceId != this.workspace.id) {
            this.inferType();
          }
        } else {
          this.termValue = undefined;
        }

      }

    }

  },

  evaluatorVisualization: function () {
    let expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (expBlock.termType.key == "list") {
        if (expBlock.termValue !== undefined) {
          let new_val = expBlock.termValue.slice(1)
          this.termValue = new_val;

          if (mnlWorkspaceId != this.workspace.id) {
            this.inferType();
          }
        } else {
          this.termValue = undefined;
        }

      }
    }

  },

  evaluatorVisualizationCBV: function () {
    let expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (expBlock.termType.key == "list") {
        if (expBlock.termValue !== undefined) {
          let new_val = expBlock.termValue.slice(1)
          this.termValue = new_val;

          if (mnlWorkspaceId != this.workspace.id) {
            this.inferType();
          }
        } else {
          this.termValue = undefined;
        }

      }
    }

  },

  updateCommentAndColour: function () {
    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType));
  },

  saveExtraState: function () {
    return {
      termType_key: this.termType.key,
      termType_value: this.termType.value,
    };
  },

  loadExtraState: function (state) {
    this.termType.key = state["termType_key"];
    this.termType.value = state["termType_value"];
  },

  inferType() {
    let expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (expBlock.termType.key == "list") {
        this.termType = expBlock.termType;
      }
    }
  },

  isNoErrorOnTermTypeOfChild() {
    let expBlock = this.getInputTargetBlock("expBlock");
    if (!expBlock.termTypeHasNoError) {
      this.errorText += "- The connected block has a term type error.\n";
      return false;
    }
    return true;
  },

  inputBloctTermTypeChecker() {
    let expBlock = this.getInputTargetBlock("expBlock");

    if (expBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedBlock, expBlock.termType)) {
        this.termTypeHasNoError &&= false;
        let formatErrorRhs =
          "- Expected term type:" +
          prettyPrintTermType(this.expectedBlock) +
          ", but found: " +
          prettyPrintTermType(expBlock.termType) +
          ".\n";
        this.errorText += formatErrorRhs;
      }
    } else {
      let formatErrorLhs =
        "- Expected term type: " +
        prettyPrintTermType(this.expectedBlock) +
        ", but found: " +
        prettyPrintTermType(expBlock.termType) +
        ".\n";
      this.errorText += formatErrorLhs;
    }
  },

  isCompleteBlock: function () {
    let expBlock = this.getInputTargetBlock("expBlock");

    if (!expBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block.\n";
    } else {
      if (!expBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block is incomplete.\n";
      }
    }
  },
};
