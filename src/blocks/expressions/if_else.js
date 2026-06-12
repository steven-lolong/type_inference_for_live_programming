/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression If-Else
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { hasAnyType } from "../../seeders/has_any_type";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { isLeftInputTermTypeEqual } from "../../seeders/is_left_input_term_equal";
import { inferringTheTypeBasedOnTheParentBlock } from "../../seeders/type_elaboration/inferring_type_based_on_parent_block";
import { mnlWorkspaceId } from "../../core_loader";

Blockly.Blocks["BlockExpIfElse"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedCondition = { key: "primitive", value: "boolean" };
    this.expectedThen = { key: "*", value: "*" };
    this.expectedElse = { key: "*", value: "*" };

    this.appendDummyInput("header")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Condition");
    this.appendValueInput("condition")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("When")
      .appendField(new MnLFieldColor(getColorByType(this.expectedCondition), null, {}), "condition_term_type_color");
    this.appendValueInput("then")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Is true")
      .appendField(new MnLFieldColor(getColorByType(this.expectedThen), null, {}), "then_term_type_color");
    this.appendValueInput("else")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Otherwise")
      .appendField(new MnLFieldColor(getColorByType(this.expectedElse), null, {}), "otherwise_term_type_color");

    this.setOutput(true, this.syntaxType);
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
    this.termValue = undefined;
    this.expectedThen = { key: "*", value: "*" };
    this.expectedElse = { key: "*", value: "*" };

    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBloctTermTypeChecker();
        if (this.termTypeHasNoError) {
          if (this.isChildThenAndElseEqual()) {
            this.setTermType();
            if (this.errorText.length === 0) {
              this.evaluator();
            }
          }
        }
      }
    }

    this.setFieldColorOfType();
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setColour(getColorByType(this.termType));
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  setFieldColorOfType() {
    let parentBlock = this.getParent();
    let whenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    let whenColor = this.getField("then_term_type_color");
    let elseColor = this.getField("otherwise_term_type_color");

    whenColor.value_ = getColorByType(this.expectedThen);
    whenColor.setTooltip(prettyPrintTermType(this.expectedThen));
    elseColor.value_ = getColorByType(this.expectedElse);
    elseColor.setTooltip(prettyPrintTermType(this.expectedElse));

    if (whenBlock) {
      whenColor.value_ = getColorByType(whenBlock.termType);
      whenColor.setTooltip(prettyPrintTermType(whenBlock.termType));
      elseColor.value_ = getColorByType(whenBlock.termType);
      elseColor.setTooltip(prettyPrintTermType(whenBlock.termType));
    }
    if (elseBlock && !whenBlock) {
      whenColor.value_ = getColorByType(elseBlock.termType);
      whenColor.setTooltip(prettyPrintTermType(elseBlock.termType));
      elseColor.value_ = getColorByType(elseBlock.termType);
      elseColor.setTooltip(prettyPrintTermType(elseBlock.termType));
    }

    if (parentBlock && !whenBlock && !elseBlock) {
      let env = {};
      let typeVarCounter = {
        a: -1,
      };
      let parentTermType = inferringTheTypeBasedOnTheParentBlock(this, this, "", env, typeVarCounter);
      if (parentTermType != "unknown") {
        whenColor.value_ = getColorByType(parentTermType);
        whenColor.setTooltip(prettyPrintTermType(parentTermType));
        elseColor.value_ = getColorByType(parentTermType);
        elseColor.setTooltip(prettyPrintTermType(parentTermType));
      }
    }

  },


  evaluator: function () {
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    let conditionBlock = this.getInputTargetBlock("condition");

    let conditionVal = '';

    if (conditionBlock) {
      conditionBlock.evaluator();
      conditionVal = conditionBlock.termValue;
    }
    if (typeof conditionVal == "boolean") {
      let theValue = undefined;
      if (conditionVal) {
        if (thenBlock) {
          thenBlock.evaluator();
          theValue = thenBlock.termValue;
        }
      } else {
        if (elseBlock) {
          elseBlock.evaluator();
          theValue = elseBlock.termValue;
        }
      }
      this.termValue = theValue;
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualization: function () {
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    let conditionBlock = this.getInputTargetBlock("condition");

    let conditionVal = '';
    if (conditionBlock) {
      conditionBlock.evaluatorVisualization();
      conditionVal = conditionBlock.termValue;
    }
    if (typeof conditionVal == "boolean") {
      let theValue = undefined;
      if (conditionVal) {
        if (thenBlock) {
          thenBlock.evaluatorVisualization();
          theValue = thenBlock.termValue;
        }
      } else {
        if (elseBlock) {
          elseBlock.evaluatorVisualization();
          theValue = elseBlock.termValue;
        }
      }
      this.termValue = theValue;
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }

  },

  evaluatorVisualizationCBV: function () {
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    let conditionBlock = this.getInputTargetBlock("condition");

    let conditionVal = '';
    if (conditionBlock) {
      conditionBlock.evaluatorVisualizationCBV();
      conditionVal = conditionBlock.termValue;
    }
    if (typeof conditionVal == "boolean") {
      let theValue = undefined;
      if (conditionVal) {
        if (thenBlock) {
          thenBlock.evaluatorVisualizationCBV();
          theValue = thenBlock.termValue;
        }
      } else {
        if (elseBlock) {
          elseBlock.evaluatorVisualizationCBV();
          theValue = elseBlock.termValue;
        }
      }
      this.termValue = theValue;
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
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


  setTermType() {
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    if (hasAnyType(thenBlock.termType)) {
      if (hasAnyType(elseBlock.termType)) {
        this.termType = thenBlock.termType;
      } else {
        this.termType = elseBlock.termType;
      }
    } else {
      this.termType = thenBlock.termType;
    }
  },

  isChildThenAndElseEqual() {
    let isEqual = true;
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");
    if (!isLeftInputTermTypeEqual(thenBlock.termType, elseBlock.termType)) {
      if (!isLeftInputTermTypeEqual(elseBlock.termType, thenBlock.termType)) {
        // this.termTypeHasNoError &&= false;
        isEqual = false;
        let formatError =
          "- The term type on Is true: " +
          prettyPrintTermType(thenBlock.termType) +
          " is not match with the term type on Otherwise: " +
          prettyPrintTermType(elseBlock.termType) +
          ".\n";
        this.errorText += formatError;

      }
    }
    return isEqual;
  },

  isNoErrorOnTermTypeOfChild() {
    let conditionBlock = this.getInputTargetBlock("condition");
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");

    if (!conditionBlock.termTypeHasNoError) {
      this.errorText +=
        "- The connected block on Condition has a term type error.\n";
      this.termTypeHasNoError &&= false;
    }

    if (!thenBlock.termTypeHasNoError) {
      this.errorText +=
        "- The connected block on Is true has a term type error.\n";
      this.termTypeHasNoError &&= false;
    }

    if (!elseBlock.termTypeHasNoError) {
      this.errorText +=
        "- The connected block on Otherwise has a term type error.\n";
      this.termTypeHasNoError &&= false;
    }

    return this.termTypeHasNoError;
  },

  inputBloctTermTypeChecker() {
    let conditionBlock = this.getInputTargetBlock("condition");
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");

    if (conditionBlock.termType.key != "*") {
      if (
        !inputTermTypeChecker(this.expectedCondition, conditionBlock.termType)
      ) {
        this.termTypeHasNoError &&= false;
        let formatErrorWhen =
          "- Expected term type on When: " +
          prettyPrintTermType(this.expectedCondition) +
          ", but found: " +
          prettyPrintTermType(conditionBlock.termType) +
          ".\n";
        this.errorText += formatErrorWhen;
      }
    } else {
      let formatErrorWhen =
        "- Expected term type on When: " +
        prettyPrintTermType(this.expectedCondition) +
        ", but found: " +
        prettyPrintTermType(conditionBlock.termType) +
        ".\n";
      this.errorText += formatErrorWhen;
    }

    if (thenBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedThen, thenBlock.termType)) {
        // this.termTypeHasNoError &&= false;
        let formatErrorThen =
          "- Expected term type on Then: " +
          prettyPrintTermType(this.expectedThen) +
          ", but found: " +
          prettyPrintTermType(thenBlock.termType) +
          ".\n";
        this.errorText += formatErrorThen;
      }
    }

    if (elseBlock.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedElse, elseBlock.termType)) {
        // this.termTypeHasNoError &&= false;
        let formatErrorOtherwise =
          "- Expected term type on Otherwise: " +
          prettyPrintTermType(this.expectedElse) +
          ", but found: " +
          prettyPrintTermType(elseBlock.termType) +
          ".\n";
        this.errorText += formatErrorOtherwise;
      }
    }
  },

  isCompleteBlock: function () {
    let conditionBlock = this.getInputTargetBlock("condition");
    let thenBlock = this.getInputTargetBlock("then");
    let elseBlock = this.getInputTargetBlock("else");

    if (!conditionBlock) {
      this.isComplete &&= false;
      this.errorText +=
        "- Require an expression block with type boolean for condition .\n";
    } else {
      if (!conditionBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText +=
          "- The expression block on Condition is incomplete.\n";
      }
    }

    if (!thenBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block for Is true.\n";
    } else {
      if (!thenBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block on Is true is incomplete.\n";
      }
    }

    if (!elseBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression for Otherwise.\n";
    } else {
      if (!elseBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText +=
          "- The expression block on Otherwise is incomplete.\n";
      }
    }
  },
};
