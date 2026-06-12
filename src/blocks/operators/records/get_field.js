/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression record operator - get field
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockOperatorRecordGetField"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedBlock = { key: "record", value: { key: "*", value: "*" } };

    this.appendDummyInput()
      .appendField("Get field", "terminal1")
      .appendField(
        new Blockly.FieldTextInput("", (e) => e.replace(/'/gi, "")),
        "fieldN"
      )

    this.appendValueInput("mainInput")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("from Record", "terminal2")
      .appendField(new MnLFieldColor(getColorByType(this.expectedBlock), null, {}), "expected_term_type_color");

    this.setColour(getColorByType(this.termType));
    this.setOutput(true, this.syntaxType);
    this.setWarningText(null); // place if there is an error regarding basic type
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setTooltip("Primitive record operator - projection");
    this.setHelpUrl("");
  },

  onchange: function () {

    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.termValue = undefined;

    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.expectedBlock = { key: "record", value: { key: "*", value: "*" } };
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));

    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBlockTermTypeChecker();
        if (this.termTypeHasNoError) {
          this.getItemTermType();

          if (this.errorText.length === 0) {
            this.evaluator();
          }

        }
      }
    }

    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setColour(getColorByType(this.termType));
    this.getField('expected_term_type_color').setTooltip(prettyPrintTermType(this.expectedBlock));

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    let fieldN = this.getFieldValue("fieldN");
    if (!mainInputBlock) {
      return;
    }
    if (mainInputBlock.termType !== undefined) {
      if (mainInputBlock.termType.key == "record") {
        if (mainInputBlock.termValue[fieldN]) {
          this.termValue = mainInputBlock.termValue[fieldN];

          if (mnlWorkspaceId != this.workspace.id) {
            this.getItemTermType();
          }
        }
      }
    }
  },

  evaluatorVisualization: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    let fieldN = this.getFieldValue("fieldN");
    if (!mainInputBlock) {
      return;
    }
    if (mainInputBlock.termType !== undefined) {
      if (mainInputBlock.termType.key == "record") {
        if (mainInputBlock.termValue[fieldN]) {
          this.termValue = mainInputBlock.termValue[fieldN];


          if (mnlWorkspaceId != this.workspace.id) {
            this.getItemTermType();
          }
        }
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    let fieldN = this.getFieldValue("fieldN");
    if (!mainInputBlock) {
      return;
    }
    if (mainInputBlock.termType !== undefined) {
      if (mainInputBlock.termType.key == "record") {
        if (mainInputBlock.termValue[fieldN]) {
          this.termValue = mainInputBlock.termValue[fieldN];


          if (mnlWorkspaceId != this.workspace.id) {
            this.getItemTermType();
          }
        }
      }
    }
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

  getItemTermType: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    const fieldN = this.getFieldValue("fieldN");
    if (mainInputBlock.termType.key == "record") {
      this.expectedBlock = mainInputBlock.termType;
      if (mainInputBlock.termType.value[fieldN]) {
        this.termType = mainInputBlock.termType.value[fieldN];
      } else {
        this.errorText += "- Field: " + fieldN + " is not found.\n";
      }
    } else {
      this.errorText += "- The input block type must be a record.\n";
    }
  },

  isNoErrorOnTermTypeOfChild: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    if (!mainInputBlock.termTypeHasNoError) {
      this.errorText += "- The connected block on LHS has a term type error.\n";
      return false;
    }
    return true;
  },

  inputBlockTermTypeChecker: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    if (mainInputBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedBlock, mainInputBlock.termType)) {
        this.termTypeHasNoError &&= false;
        let formatError =
          "- Expected term type: " +
          prettyPrintTermType(this.expectedBlock) +
          ", but found: " +
          prettyPrintTermType(mainInputBlock.termType) +
          ".\n";
        this.errorText += formatError;
      }
    } else {
      let formatError =
        "- Expected term type: " +
        prettyPrintTermType(this.expectedBlock) +
        ", but found: " +
        prettyPrintTermType(mainInputBlock.termType) +
        ".\n";
      this.errorText += formatError;
    }
  },

  isCompleteBlock: function () {
    let mainInputBlock = this.getInputTargetBlock("mainInput");
    if (!mainInputBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block.\n";
    } else {
      if (!mainInputBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block is incomplete.\n";
      }
    }
  },
};
