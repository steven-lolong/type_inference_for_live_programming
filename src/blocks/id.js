/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Identity block 
 */

import Blockly from "blockly/core";
import { getColorByType } from "../seeders/color_definitions";
import { mnlWorkspaceId } from "../core_loader";

Blockly.Blocks["BlockID"] = {
  init: function () {
    this.syntaxType = "uid";
    this.termType = { key: "nothing", value: '' };
    this.termValue = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendDummyInput("id_dummy_input")
      .appendField("Identifier", "terminal")
      .appendField(
        new Blockly.FieldTextInput("", (e) => e.replace(/'|-|\s/gi, "_")),
        "identity"
      );
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },

  onchange: function () {

    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.errorText = "";

    this.isCompleteBlock();
    this.showHideTerminal();

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {

  },

  evaluatorVisualization: function () {
    this.showHideTerminal();
  },

  evaluatorVisualizationCBV: function () {
    this.showHideTerminal();
  },

  showHideTerminal() {
    if (this.getParent()) this.setFieldValue("", "terminal");
    else this.setFieldValue("Identifier", "terminal");
  },

  isCompleteBlock: function () {
    const varName = this.getFieldValue("identity");

    if (varName.length === 0) {
      this.isComplete &&= false;
      this.errorText = "The name can't be empty";
    }
  },
};
