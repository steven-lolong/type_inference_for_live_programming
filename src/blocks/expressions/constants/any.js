/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Constant any 
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../../seeders/color_definitions";
import { formattingComment } from "../../../seeders/formatting_comment";
import { mnlWorkspaceId } from "../../../core_loader";

Blockly.Blocks["BlockConstAny"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;
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
    this.setWarningText(null);

    if (this.getParent()) this.setFieldValue("", "terminal");
    else this.setFieldValue("any", "terminal");

    this.evaluator();
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  evaluator: function () {
    // this.termValue = undefined;
  },

  evaluatorVisualization: function () {
    // this.termValue = undefined;
  },

  evaluatorVisualizationCBV: function () {
    // this.termValue = undefined;
  },

  saveExtraState: function () {
    return {
      termType_key: this.termType.key,
      termType_value: this.termType.value,
      termValue: this.termValue,
    };
  },

  loadExtraState: function (state) {
    this.termType.key = state["termType_key"];
    this.termType.value = state["termType_value"];
    this.termValue = state["termValue"];
  },
};
