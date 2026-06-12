/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression Lambda
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { isANestedFunction } from "../../seeders/type_elaboration/is_a_nested_function";
import { typeConstructor } from "../../seeders/type_elaboration/type_constructor";
import { doesItTriggerCircularity } from "../../seeders/type_elaboration/circularity_checker/circularity_checker";
import { inputTermTypeChecker } from "../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { getParentName } from "../../seeders/type_elaboration/get_parent_name";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../core_loader";

Blockly.Blocks["BlockExpLambda"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = {
      key: "function",
      value: {
        from: { key: "*", value: "*" },
        to: { key: "*", value: "*" },
      },
    };
    this.termValue = {
      from: {},
      to: {},
    };

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.tempLambdaName = "";

    this.appendDummyInput("header").appendField("Lambda");
    this.appendValueInput("inputParam")
      .setCheck("param")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Parameter");
    this.appendValueInput("inputExp")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Expression")
      .appendField(new MnLFieldColor(getColorByType(this.termType.value.to), null, {}), "body_color");

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
    let bodyColor = this.getField("body_color");

    this.resetToDefaultFunctionTermType();
    this.termValue = { from: {}, to: {} };

    this.setColour(getColorByType(this.termType));

    this.isCompleteBlock();

    if (this.isComplete) {
      if (
        this.isNoErrorOnTermTypeOfExpBlock() &&
        this.isNoErrorOnTermTypeOfParameter()
      ) {
        if (!isANestedFunction(this)) {
          // do type inference here
          let typeVarCounter = {
            a: 0,
          };
          this.resetToDefaultFunctionTermType();
          let funName = getParentName(this);
          let inputExp = this.getInputTargetBlock("inputExp");
          if (doesItTriggerCircularity(this, inputExp, funName)) {
            this.termTypeHasNoError &&= false;
            this.errorText += "- Circularity detected.\n";
          } else {
            typeConstructor(this, {}, {}, typeVarCounter);
            this.setCommentText(
              formattingComment(this.syntaxType, this.termType)
            );
            this.exptectedTermTypeOfBody();
          }
        }
        else {
          let paramBlock = this.getInputTargetBlock("inputParam");
          let expBlock = this.getInputTargetBlock("inputExp");
          this.termType = {
            key: "function",
            value: {
              from: paramBlock.termType,
              to: expBlock.termType,
            },
          };
        }
      }
    }

    if (this.errorText.length === 0) {
      this.evaluator();
    }

    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    bodyColor.value_ = getColorByType(this.termType.value.to);
    bodyColor.applyColour();
    bodyColor.setTooltip(prettyPrintTermType(this.termType.value.to));

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    let paramBlock = this.getInputTargetBlock("inputParam");
    let expBlock = this.getInputTargetBlock("inputExp");

    if (paramBlock && expBlock) {
      paramBlock.evaluator();
      this.termValue = {
        from: Blockly.serialization.blocks.save(paramBlock),
        to: Blockly.serialization.blocks.save(expBlock, { doFullSerialization: true, saveIds: false, addInputBlocks: true }),
      };
    }

  },

  evaluatorVisualization: function () {
    let paramBlock = this.getInputTargetBlock("inputParam");
    let expBlock = this.getInputTargetBlock("inputExp");

    if (paramBlock && expBlock) {
      paramBlock.evaluatorVisualization();
      this.termValue = {
        from: Blockly.serialization.blocks.save(paramBlock),
        to: Blockly.serialization.blocks.save(expBlock, { doFullSerialization: true, saveIds: false, addInputBlocks: true }),
      };
    }

  },

  evaluatorVisualizationCBV: function () {
    let paramBlock = this.getInputTargetBlock("inputParam");
    let expBlock = this.getInputTargetBlock("inputExp");

    if (paramBlock && expBlock) {
      paramBlock.evaluatorVisualizationCBV();
      this.termValue = {
        from: Blockly.serialization.blocks.save(paramBlock),
        to: Blockly.serialization.blocks.save(expBlock, { doFullSerialization: true, saveIds: false, addInputBlocks: true }),
      };
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

  resetToDefaultFunctionTermType() {
    let paramBlock = this.getInputTargetBlock("inputParam");
    if (paramBlock) {
      this.termType = {
        key: "function",
        value: {
          from: paramBlock.termType,
          to: { key: "*", value: "*" },
        },
      };
    } else {
      this.termType = {
        key: "function",
        value: {
          from: { key: "*", value: "*" },
          to: { key: "*", value: "*" },
        },
      };
    }

  },

  exptectedTermTypeOfBody() {
    let expBlock = this.getInputTargetBlock("inputExp");
    if (!inputTermTypeChecker(this.termType.value.to, expBlock.termType)) {
      this.termTypeHasNoError &&= false;
      let formatErrorLhs =
        "- Expected term type on Expression: " +
        prettyPrintTermType(this.termType.value.to) +
        ", but found: " +
        prettyPrintTermType(expBlock.termType) +
        ".\n";
      this.errorText += formatErrorLhs;
    }
  },

  isNoErrorOnTermTypeOfParameter() {
    let noTermTypeError = true;
    let paramBlock = this.getInputTargetBlock("inputParam");
    if (!paramBlock.termTypeHasNoError) {
      noTermTypeError = false;
      this.termTypeHasNoError &&= false;
      this.errorText += "- The connected block on Parameter has an error.\n";
    }
    return noTermTypeError;
  },

  isNoErrorOnTermTypeOfExpBlock() {
    let noTermTypeError = true;
    let expBlock = this.getInputTargetBlock("inputExp");
    if (!expBlock.termTypeHasNoError) {
      noTermTypeError = false;
      this.termTypeHasNoError &&= false;
      this.errorText +=
        "- The connected block on Expression has a term type error.\n";
    }
    return noTermTypeError;
  },

  isCompleteBlock: function () {
    let paramBlock = this.getInputTargetBlock("inputParam");
    let expBlock = this.getInputTargetBlock("inputExp");

    if (!paramBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require a parameter block.\n";
    } else {
      if (!paramBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- Parameter block is incomplete.\n";
      }
    }

    if (!expBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block.\n";
    } else {
      let allChilds = expBlock.getDescendants();
      let childIsComplete = true;
      for (let i = 0; i < allChilds.length; i++) {
        if (!allChilds[i].isComplete) {
          childIsComplete &&= false;
        }
      }

      if (!childIsComplete) {
        this.isComplete &&= false;
        this.errorText += "- Expression block is incomplete.\n";
      }
    }
  },
};
