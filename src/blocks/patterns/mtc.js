/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Pattern match
 */

import Blockly from "blockly/core";
import { formattingComment } from "../../seeders/formatting_comment";
import { getColorByType } from "../../seeders/color_definitions";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../core_loader";

Blockly.Blocks["BlockPatternMatch"] = {
  init: function () {
    this.syntaxType = "mtc";
    this.termType = {
      key: "match",
      value: { pat: { key: "*", value: "*" }, exp: { key: "*", value: "*" } },
    };
    this.termValue = { pat: undefined, exp: undefined };

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.appendValueInput("pattern").setCheck("pat")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("is")
      .appendField(new MnLFieldColor(getColorByType(this.termType.value.pat), null, {}), "pattern_color");
    this.appendValueInput("exp").setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("do")
      .appendField(new MnLFieldColor(getColorByType(this.termType.value.exp), null, {}), "exp_color");
    this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setTooltip("Primitive boolean operator - compare");
    this.setHelpUrl("");

    this.setWarningText(null);
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.activeOperator = "and";
  },

  validate: function (newValue) {
    this.getSourceBlock().updateConnection(newValue);
    return newValue;
  },

  updateConnection: function (newValue) {
    this.activeOperator = newValue;
  },

  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = {
      key: "match",
      value: { pat: { key: "*", value: "*" }, exp: { key: "*", value: "*" } },
    };
    this.termValue = { pat: undefined, exp: undefined };

    this.colorSuggestion();

    this.isCompleteBlock();
    if (this.isComplete && this.termTypeHasNoError) {
      this.constructTermType();
      if (this.errorText.length === 0) {
        this.evaluator();
      }
    }
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }

    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  evaluator: function () {
    let patternBlock = this.getInputTargetBlock("pattern");
    let expBlock = this.getInputTargetBlock("exp");
    if (patternBlock && expBlock) {
      this.termValue.pat = patternBlock.termValue;
      this.termValue.exp = expBlock.termValue;
    }
  },

  evaluatorVisualization: function () {
    let patternBlock = this.getInputTargetBlock("pattern");
    let expBlock = this.getInputTargetBlock("exp");
    if (patternBlock && expBlock) {
      this.termValue.pat = patternBlock.termValue;
      this.termValue.exp = expBlock.termValue;
    }
  },

  evaluatorVisualizationCBV: function () {
    let patternBlock = this.getInputTargetBlock("pattern");
    let expBlock = this.getInputTargetBlock("exp");
    if (patternBlock && expBlock) {
      this.termValue.pat = patternBlock.termValue;
      this.termValue.exp = expBlock.termValue;
    }
  },

  colorSuggestion: function () {
    let parentBlock = this.getParent();
    // let patter_color_field = this.getField("pattern_color");
    // let exp_color_field = this.getField("exp_color");
    if (parentBlock) {
      this.getField("pattern_color").value_ = getColorByType(parentBlock.expectedSwitchType);
      this.getField("exp_color").value_ = getColorByType(parentBlock.expectedChildTermType);
    } else {
      this.getField("pattern_color").value_ = getColorByType(this.termType.value.pat);
      this.getField("exp_color").value_ = getColorByType(this.termType.value.exp);
    }
    this.getField("pattern_color").applyColour();
    this.getField("exp_color").applyColour();
  },

  constructTermType: function () {
    let patternBlock = this.getInputTargetBlock("pattern");
    let expBlock = this.getInputTargetBlock("exp");
    this.termType = {
      key: "match",
      value: {
        pat: patternBlock.termType,
        exp: expBlock.termType,
      },
    };
  },

  isCompleteBlock: function () {
    let patternBlock = this.getInputTargetBlock("pattern");
    let expBlock = this.getInputTargetBlock("exp");

    if (!patternBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require a pattern block.\n";
    } else {
      if (!patternBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- Pattern block is incomplete.\n";
      }
    }
    if (!expBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block.\n";
    } else {
      if (!expBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- Expression block is incomplete.\n";
      } else {
        if (!expBlock.termTypeHasNoError) {
          this.termTypeHasNoError &&= false;
          this.errorText += "- Expression block has a term type error.\n";
        }
      }
    }
  },
};
