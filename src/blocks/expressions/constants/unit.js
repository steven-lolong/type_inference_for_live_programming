/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Constant unit
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockConstUnit"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "primitive", value: "unit" };
    this.termValue = "()";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.appendDummyInput("mainInput").appendField("unit", "terminal");
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
    else this.setFieldValue("unit", "terminal");

    this.evaluator();
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  evaluator: function () {
    this.termValue = "()";
  },

  evaluatorVisualization: function () {
    this.termValue = "()";
  },

  evaluatorVisualizationCBV: function () {
    this.termValue = "()";
  },
};
