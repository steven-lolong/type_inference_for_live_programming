/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression Character Operator - char to ascii
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockOperatorCharacterToASCII"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "primitive", value: "number" };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedBlock = { key: "primitive", value: "character" };

    this.appendValueInput("expBlock")
      .setCheck("exp")
      .appendField("Character to ASCII").appendField(new MnLFieldColor(getColorByType(this.expectedBlock), null, {}), "expected_term_type_color");
    // this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setTooltip("Primitive character operator - to ASCII");
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

    this.getField('expected_term_type_color').setTooltip(prettyPrintTermType(this.expectedBlock));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
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

  evaluator: function () {
    const expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (typeof expBlock.termValue === "string") {
        this.termValue = expBlock.termValue.charCodeAt(0);
      }
    }
  },

  evaluatorVisualization: function () {
    const expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (typeof expBlock.termValue === "string") {
        this.termValue = expBlock.termValue.charCodeAt(0);
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    const expBlock = this.getInputTargetBlock("expBlock");
    if (expBlock) {
      if (typeof expBlock.termValue === "string") {
        this.termValue = expBlock.termValue.charCodeAt(0);
      }
    }
  },

  inputBloctTermTypeChecker() {
    let expBlock = this.getInputTargetBlock("expBlock");

    if (expBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedBlock, expBlock.termType)) {
        this.termTypeHasNoError &&= false;
        let formatErrorRhs =
          "- Expected term type: " +
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
