/* @license
 * Copyright MnL 2020-2025 
 * SPDX-License-Identifier:  GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 *
 * @fileoverview File's block for MnL
 * The block acts like a file in text-based programming environment
 */

import Blockly from "blockly";
import { getColorByType } from "../seeders/color_definitions";

Blockly.Blocks["BlockMainFile"] = {
  init: function () {
    this.appendDummyInput().appendField("");
    // .appendField(new Blockly.FieldTextInput(""), "name");
    this.appendStatementInput("body").setCheck("dec");
    this.setColour(getColorByType({ key: "BlockMainFile" }));
    this.setTooltip("The main file");
  },
};

Blockly.Blocks["DescriptionBlock"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("", "description")
    this.setColour(getColorByType({ key: "DescriptionBlock" }));
    this.setTooltip("The program description");
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
  },
};
