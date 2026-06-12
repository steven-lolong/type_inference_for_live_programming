/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Constant number
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockConstNumber"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "primitive", value: "number" };
    this.termValue = 0;
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.appendDummyInput("mainInput")
      .appendField("number", "terminal")
      .appendField(new Blockly.FieldNumber(0), "value");
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

    if (this.getParent()) this.setFieldValue("", "terminal");
    else this.setFieldValue("number", "terminal");

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
