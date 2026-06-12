/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Pattern - Any Value 
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockPatternConstAnyValue"] = {
  init: function () {
    this.syntaxType = "pat";
    this.termType = { key: "*", value: "*" };
    this.termValue = "*";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.appendDummyInput("mainInput").appendField("any", "terminal");
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
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.evaluator();

    this.setWarningText(null);
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  evaluator: function () {
    this.termValue = "*";
  },

  evaluatorVisualization: function () {
    this.termValue = "*";
  },

  evaluatorVisualizationCBV: function () {
    this.termValue = "*";
  },

};
