/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression Application
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../seeders/input_term_type_checker";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { hasTypeVariable } from "../../seeders/type_elaboration/has_type_variable";
import { appBlockTypeConstructor } from "../../seeders/type_elaboration/application_block_type_elaboration/app_type_constructor";
import { doesTermTypeHaveEqualValue } from "../../seeders/helper/does_term_type_have_equal_value";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId, evalVisualizationWorkspace, evalVisualizationWorkspaceCBV } from "../../core_loader";
import { termValueEvaluator } from "../../seeders/value_evaluation/term_value_evaluator";
import { betaReductionVisualization } from "../../seeders/program_visualization/beta_reduction_visualization";
import { betaReductionVisualizationCBV } from "../../seeders/program_visualization/beta_reduction_visualization_cbv";
import { workspaceBlockOrder, workspaceBlockOrderCBV } from "../../core_loader";
import { arrangeBlocksVertically } from "../../seeders/helper/arrange_block";

Blockly.Blocks["BlockExpApplication"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.expectedExp1 = {
      key: "function",
      value: { from: { key: "*", value: "*" }, to: { key: "*", value: "*" } },
    };
    this.expectedExp2 = { key: "*", value: "*" };

    this.appendValueInput("exp1")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Application of")
      .appendField(new MnLFieldColor(getColorByType(this.expectedExp1), null, {}), "function_color");
    this.appendValueInput("exp2")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Over", "desc")
      .appendField(new MnLFieldColor(getColorByType(this.expectedExp2), null, {}), "app_over_term_type_color");

    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.getField('function_color').setTooltip("function");
    this.setWarningText(null); // place if there is an error regardint basic type
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }
    this.termValue = undefined;
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.expectedExp2 = { key: "*", value: "*" };
    this.setFieldValue("Over", "desc");

    let app_over_color = this.getField('app_over_term_type_color');
    app_over_color.value_ = getColorByType(this.expectedExp2);
    app_over_color.setTooltip(prettyPrintTermType(this.expectedExp2));

    let funcBlock = this.getInputTargetBlock("exp1");
    if (funcBlock) {
      if (funcBlock.termType.key == "function") {
        app_over_color.value_ = getColorByType(funcBlock.termType.value.from);
        app_over_color.setTooltip(prettyPrintTermType(funcBlock.termType.value.from));
      }
    }
    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.inputBlockTermTypeChecker();
        if (this.termTypeHasNoError) {
          this.inferType();

          if (this.errorText.length === 0) {
            this.evaluator();
          }
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
    let funcBlock = this.getInputTargetBlock("exp1");
    let subsBlock = this.getInputTargetBlock("exp2");
    if (funcBlock && subsBlock) {
      let substitution_block = Blockly.serialization.blocks.save(subsBlock);
      if (
        funcBlock.termType.key == "function" &&
        funcBlock.termValue != undefined &&
        funcBlock.termValue.from != undefined
      ) {
        this.termValue = termValueEvaluator(
          funcBlock.termValue.to,
          funcBlock.termValue.from,
          substitution_block
        );

      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.inferType();
      }
    }

  },

  evaluatorVisualization: function () {
    let funcBlock = this.getInputTargetBlock("exp1");
    let subsBlock = this.getInputTargetBlock("exp2");
    if (funcBlock && subsBlock) {
      let substitution_block = Blockly.serialization.blocks.save(subsBlock);
      if (
        funcBlock.termType.key == "function" &&
        funcBlock.termValue != undefined &&
        funcBlock.termValue.from != undefined
      ) {
        this.termValue = betaReductionVisualization(
          Object.assign({}, funcBlock.termValue.to),
          Object.assign({}, funcBlock.termValue.from),
          Object.assign({}, Object.assign({}, substitution_block))
        );
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.inferType();
      }
    }

  },

  evaluatorVisualizationCBV: function () {
    let funcBlock = this.getInputTargetBlock("exp1");
    let subsBlock = this.getInputTargetBlock("exp2");
    if (funcBlock && subsBlock) {
      let substitution_block = Blockly.serialization.blocks.save(subsBlock);
      if (
        funcBlock.termType.key == "function" &&
        funcBlock.termValue != undefined &&
        funcBlock.termValue.from != undefined
      ) {
        this.termValue = betaReductionVisualizationCBV(
          Object.assign({}, funcBlock.termValue.to),
          Object.assign({}, funcBlock.termValue.from),
          Object.assign({}, Object.assign({}, substitution_block))
        );
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.inferType();
      }
    }

  },

  igniteProgramVisualizationForBetaReduction: function () {
    evalVisualizationWorkspace.clear();
    if (this.errorText.length === 0) {
      let funcBlock = this.getInputTargetBlock("exp1");
      let subsBlock = this.getInputTargetBlock("exp2");
      if (funcBlock && subsBlock) {
        let substitution_block = Blockly.serialization.blocks.save(subsBlock);
        if (
          funcBlock.termType.key == "function" &&
          funcBlock.termValue != undefined &&
          funcBlock.termValue.from != undefined
        ) {
          // Ignore the double computation of return value by evaluatorVisualization since this is only for program visualization purposes.
          betaReductionVisualization(
            Object.assign({}, funcBlock.termValue.to),
            Object.assign({}, funcBlock.termValue.from),
            Object.assign({}, Object.assign({}, substitution_block))
          );
          arrangeBlocksVertically(evalVisualizationWorkspace, workspaceBlockOrder, 32);
          // evalVisualizationWorkspace.cleanUp();
        }
      }
    }
  },

  igniteProgramVisualizationForBetaReductionCBV: function () {
    evalVisualizationWorkspaceCBV.clear();
    if (this.errorText.length === 0) {
      let funcBlock = this.getInputTargetBlock("exp1");
      let subsBlock = this.getInputTargetBlock("exp2");
      if (funcBlock && subsBlock) {
        let substitution_block = Blockly.serialization.blocks.save(subsBlock);
        if (
          funcBlock.termType.key == "function" &&
          funcBlock.termValue != undefined &&
          funcBlock.termValue.from != undefined
        ) {
          // Ignore the double computation of return value by evaluatorVisualization since this is only for program visualization purposes.          
          betaReductionVisualizationCBV(
            Object.assign({}, funcBlock.termValue.to),
            Object.assign({}, funcBlock.termValue.from),
            Object.assign({}, Object.assign({}, substitution_block))
          );
          arrangeBlocksVertically(evalVisualizationWorkspaceCBV, workspaceBlockOrderCBV, 32);
          // evalVisualizationWorkspaceCBV.cleanUp();
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

  inferType() {
    let exp1Block = this.getInputTargetBlock("exp1");
    let exp2Block = this.getInputTargetBlock("exp2");

    let exp1TermType = exp1Block ? Object.assign({}, exp1Block.termType) : null;
    if (
      Object.keys(exp1TermType).length > 0 &&
      exp1TermType.key == "function"
    ) {
      let paramType = {};
      paramType = Object.assign({}, exp1TermType.value.from);
      this.expectedExp2 = Object.assign({}, paramType);
      this.termType = Object.assign({}, exp1TermType.value.to);

      if (hasTypeVariable(paramType)) {
        if (exp2Block) {
          let timeNow = Date.now().toString();
          let newTypeEnv = Array();
          newTypeEnv[timeNow] = Object.assign(
            {},
            appBlockTypeConstructor(exp1TermType, exp2Block.termType)
          );
          if (
            newTypeEnv[timeNow] &&
            Object.keys(newTypeEnv[timeNow]).length != 0
          ) {
            this.termType = Object.assign({}, newTypeEnv[timeNow].value.to);
            this.expectedExp2 = Object.assign(
              {},
              newTypeEnv[timeNow].value.from
            );
            this.getField('app_over_term_type_color').value_ = getColorByType(this.expectedExp2);
            this.getField('app_over_term_type_color').setTooltip(prettyPrintTermType(this.expectedExp2));
          }
        }
      } else {
        // the input termType is a concrete exp1TermType
        this.termType = Object.assign({}, exp1TermType.value.to);
        this.expectedExp2 = Object.assign({}, exp1TermType.value.from);
        this.getField('app_over_term_type_color').value_ = getColorByType(this.expectedExp2);
        this.getField('app_over_term_type_color').setTooltip(prettyPrintTermType(this.expectedExp2));
      }
    }
    this.inputBlockTermTypeChecker();
  },

  isNoErrorOnTermTypeOfChild() {
    let noTermTypeError = true;
    let exp1Block = this.getInputTargetBlock("exp1");
    let exp2Block = this.getInputTargetBlock("exp2");

    if (!exp1Block.termTypeHasNoError) {
      this.errorText +=
        "- The connected block on exp1 has a term type error.\n";
      // noTermTypeError &&= false;
    }

    if (exp2Block && !exp2Block.termTypeHasNoError) {
      this.errorText +=
        "- The connected block on exp2 has a term type error.\n";
      // noTermTypeError &&= false;
    }

    return noTermTypeError;
  },

  inputBlockTermTypeChecker() {
    let exp1Block = this.getInputTargetBlock("exp1");
    let exp2Block = this.getInputTargetBlock("exp2");

    if (exp1Block.termType.key != "*") {
      if (!inputTermTypeChecker(this.expectedExp1, exp1Block.termType)) {
        this.termTypeHasNoError &&= false;
        let formatErrorexp1 =
          "- Expected term type on exp1: " +
          prettyPrintTermType(this.expectedExp1) +
          ", but found: " +
          prettyPrintTermType(exp1Block.termType) +
          ".\n";
        this.errorText += formatErrorexp1;
      }
    } else {
      let formatErrorexp1 =
        "- Expected term type on exp1: " +
        prettyPrintTermType(this.expectedExp1) +
        ", but found: " +
        prettyPrintTermType(exp1Block.termType) +
        ".\n";
      this.errorText += formatErrorexp1;
    }

    if (exp2Block) {
      if (this.expectedExp2.value != "*") {
        if (exp2Block.termType.key != "*") {
          if (!inputTermTypeChecker(this.expectedExp2, exp2Block.termType)) {
            this.termTypeHasNoError &&= false;
            let formatErrorexp2 =
              "- Expected term type on exp2: " +
              prettyPrintTermType(this.expectedExp2) +
              ", but found: " +
              prettyPrintTermType(exp2Block.termType) +
              ".\n";
            this.errorText += formatErrorexp2;
          }
        } else if (
          !doesTermTypeHaveEqualValue(this.expectedExp2, exp2Block.termType)
        ) {
          let formatErrorexp2 =
            "- Expected term type on exp2: " +
            prettyPrintTermType(this.expectedExp2) +
            ", but found: " +
            prettyPrintTermType(exp2Block.termType) +
            ".\n";
          this.errorText += formatErrorexp2;
        }
      }
    }
  },

  isCompleteBlock: function () {
    let exp1Block = this.getInputTargetBlock("exp1");
    let exp2Block = this.getInputTargetBlock("exp2");

    if (!exp1Block) {
      this.isComplete &&= false;
      this.errorText += "- Require an expression block on exp1.\n";
    } else {
      if (!exp1Block.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The expression block on exp1 is incomplete.\n";
      }
    }

    if (!exp2Block) {
      // this.isComplete &&= false;
      this.errorText += "- Require an expression block on the over input.\n";
    } else {
      if (!exp2Block.isComplete) {
        this.isComplete &&= false;
        this.errorText +=
          "- The expression block on the over input is incomplete.\n";
      }
    }
  },
};
