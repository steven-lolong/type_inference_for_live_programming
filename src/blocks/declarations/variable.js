/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Declaration Variable
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { hasNameConflict } from "../../seeders/check_name_conflict";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { mnlWorkspaceId } from "../../core_loader";

Blockly.Blocks["BlockDecVariable"] = {
  init: function () {
    this.syntaxType = "dec";
    this.termType = { key: "*", value: "*" };
    this.termValue = "";

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;
    this.expectedExpressionTypeTerm = { key: "*", value: "*" };

    this.appendValueInput("inputId")
      .setCheck("uid")
      .appendField("Variable")
      .setAlign(Blockly.inputs.Align.RIGHT);
    this.appendValueInput("inputExp")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("bind to")
      .appendField(new MnLFieldColor(getColorByType(this.expectedExpressionTypeTerm), null, {}), "bind_to_color");

    this.setPreviousStatement(true, this.syntaxType);
    this.setNextStatement(true, this.syntaxType);

    this.setInputsInline(false);
    this.setColour(getColorByType(this.termType));

    this.setWarningText(null); // place if there is an error regardint basic type
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };

    let bindColor = this.getField("bind_to_color");
    bindColor.setTooltip(prettyPrintTermType(this.expectedExpressionTypeTerm));

    this.isCompleteBlock();
    if (this.isComplete) {
      if (!hasNameConflict(this, 1)) {
        if (this.isNoErrorOnTermTypeOfExpBlock()) {
          this.setTermType();
          this.evaluator();
        }
      }
    }

    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setColour(getColorByType(this.termType));
    this.getField("bind_to_color").value_ = getColorByType(this.termType);
    bindColor.setTooltip(prettyPrintTermType(this.termType));

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  setTermType: function () {
    let expBlock = this.getInputTargetBlock("inputExp");
    this.termType = expBlock.termType;
  },

  evaluator: function () {
    let expBlock = this.getInputTargetBlock("inputExp");
    const newTermValue = JSON.stringify({ termValue: expBlock.termValue });
    this.termValue = JSON.parse(newTermValue).termValue;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
    }
  },

  evaluatorVisualization: function () {
    let expBlock = this.getInputTargetBlock("inputExp");
    const newTermValue = JSON.stringify({ termValue: expBlock.termValue });
    this.termValue = JSON.parse(newTermValue).termValue;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
    }
  },

  evaluatorVisualizationCBV: function () {
    let expBlock = this.getInputTargetBlock("inputExp");
    const newTermValue = JSON.stringify({ termValue: expBlock.termValue });
    this.termValue = JSON.parse(newTermValue).termValue;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
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

  isNoErrorOnTermTypeOfExpBlock: function () {
    let noTermTypeError = true;
    let expBlock = this.getInputTargetBlock("inputExp");
    if (!expBlock.termTypeHasNoError) {
      noTermTypeError = false;
      this.termTypeHasNoError &&= false;
      this.errorText +=
        "- The connected block on 'to' has a term type error.\n";
    }
    return noTermTypeError;
  },

  isCompleteBlock: function () {
    let uidBlock = this.getInputTargetBlock("inputId");
    let expBlock = this.getInputTargetBlock("inputExp");

    if (!uidBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an identifier block.\n";
    } else {
      if (!uidBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- ID block is incomplete.\n";
      }
    }

    if (!expBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block.\n";
    } else {
      if (!expBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- Expression block is incomplete.\n";
      }
    }
  },
};
