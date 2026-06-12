/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Constant boolean
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlocPatternConstCharacter"] = {
  init: function () {
    this.syntaxType = "pat";
    this.termType = { key: "primitive", value: "character" };
    this.termValue = '';

    this.isComplete = true;
    this.termTypeHasNoError = true;

    let validator = (strValue) => {
      return strValue.charAt(0);
    };
    this.appendDummyInput("mainInput")
      .appendField("character", "terminal")
      .appendField(new Blockly.FieldTextInput("", validator), "value");
    this.setColour(getColorByType(this.termType));
    this.setOutput(true, this.syntaxType);
    this.setWarningText(null); // place if there is an error regarding basic type
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.setHelpUrl("");
  },
  onchange: function () {

    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.setWarningText(null);
    this.termValue = '';

    if (this.getParent()) this.setFieldValue("", "terminal");
    else this.setFieldValue("character", "terminal");

    this.evaluator();
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  evaluator: function () {
    this.termValue = this.getFieldValue("value");
  },

  evaluatorVisualization: function () {
    this.termValue = this.getFieldValue("value");
  },

  evaluatorVisualizationCBV: function () {
    this.termValue = this.getFieldValue("value");
  },

};
