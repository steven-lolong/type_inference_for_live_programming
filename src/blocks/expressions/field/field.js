/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Field of record
 */

import Blockly from "blockly/core";
import { formattingComment } from "../../../seeders/formatting_comment";
import { getColorByType } from "../../../seeders/color_definitions";
import { getName } from "../../../seeders/get_function_name";
import { MnLFieldColor } from "../../../plugins/field_color/mnl_field_color";
import { prettyPrintTermType } from "../../../seeders/pretty_print_term_type";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockField"] = {
  init: function () {
    this.syntaxType = "field";
    this.termType = {
      key: "field",
      value: { fName: "", fValue: { key: "*", value: "*" } },
    };
    this.termValue = { fName: '', fValue: '' };

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;
    this.expectedBlock = { key: "*", value: "*" };

    this.appendValueInput("inputId")
      .setCheck("uid")
      .appendField("Field", "terminal");
    this.appendValueInput("inputExp").setCheck("exp").appendField("=")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(new MnLFieldColor(getColorByType(this.expectedBlock), null, {}), "suggestionColor");
    this.setInputsInline(true);
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType.value.fValue));

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

    this.constructTermType();

    this.getParent()
      ? this.setFieldValue("", "terminal")
      : this.setFieldValue("Field", "terminal");

    this.isCompleteBlock();
    if (this.isComplete) {
      this.checkNameConflict();
      if (this.termTypeHasNoError) {
        this.constructTermType();
        if (this.errorText.length === 0) {
          this.evaluator();
        }
      }
    }


    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setColour(getColorByType(this.termType.value.fValue));
    this.updateSuggestionColor();
    // show error message
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    let fName = getName(this, 5);
    let expBlock = this.getInputTargetBlock("inputExp");
    if (expBlock) {
      this.termValue = {
        fName: fName,
        fValue: expBlock.termValue
      };
      if (mnlWorkspaceId != this.workspace.id) {
        this.constructTermType();
      }
    }
  },

  evaluatorVisualization: function () {
    let fName = getName(this, 5);
    let expBlock = this.getInputTargetBlock("inputExp");
    if (expBlock) {
      this.termValue = {
        fName: fName,
        fValue: expBlock.termValue
      };
      if (mnlWorkspaceId != this.workspace.id) {
        this.constructTermType();
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    let fName = getName(this, 5);
    let expBlock = this.getInputTargetBlock("inputExp");
    if (expBlock) {
      this.termValue = {
        fName: fName,
        fValue: expBlock.termValue
      };
      if (mnlWorkspaceId != this.workspace.id) {
        this.constructTermType();
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

  constructTermType: function () {
    let fName = getName(this, 5);
    let expBlock = this.getInputTargetBlock("inputExp");
    if (expBlock) {
      this.termType = {
        key: "field",
        value: { fName: fName, fValue: expBlock.termType },
      };
    } else {
      this.termType = {
        key: "field",
        value: { fName: fName, fValue: { key: "*", value: "*" } },
      };
    }
  },

  updateSuggestionColor: function () {
    let suggestionColorField = this.getField("suggestionColor");
    let parentBlock = this.getParent();

    suggestionColorField.value_ = getColorByType(this.expectedBlock);
    suggestionColorField.setTooltip(prettyPrintTermType(this.expectedBlock));

    if (parentBlock && parentBlock.type == "BlockExpRecordConstructor") {
      for (let name_ in parentBlock.suggestionTermType) {
        if (name_ == getName(this, 5)) {
          suggestionColorField.value_ = getColorByType(parentBlock.suggestionTermType[name_]);
          suggestionColorField.setTooltip(prettyPrintTermType(parentBlock.suggestionTermType[name_]));
          suggestionColorField.applyColour();

          return;
        }
      }
    }
    let childBlock = this.getInputTargetBlock("inputExp");
    if (childBlock) {
      suggestionColorField.value_ = getColorByType(childBlock.termType);
      suggestionColorField.setTooltip(prettyPrintTermType(childBlock.termType));
    }
    suggestionColorField.applyColour();
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

  checkNameConflict: function () {
    let parentBlock = this.getParent();
    let fieldName = getName(this, 5);
    if (parentBlock) {
      for (let i = 0; i < parentBlock.itemCount_; i++) {
        let child = parentBlock.getInputTargetBlock("ADD" + i);
        if (child) {
          if (child.id != this.id) {
            let otherFieldName = getName(child, 5);
            if (otherFieldName == fieldName) {
              this.errorText += "- Name conflict.\n";
              this.termTypeHasNoError &&= false;
            }
          }
        }
      }
    }
  },
};
