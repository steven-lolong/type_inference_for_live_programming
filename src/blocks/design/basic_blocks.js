/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Constant string
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";

Blockly.Blocks["BlockDesignUID"] = {
  init: function () {
    this.syntaxType = "uid";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("uid")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },

};

Blockly.Blocks["BlockDesignEXP"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("exp")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },

};

Blockly.Blocks["BlockDesignPARAM"] = {
  init: function () {
    this.syntaxType = "param";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("param")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },

};

Blockly.Blocks["BlockDesignPAT"] = {
  init: function () {
    this.syntaxType = "pat";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("pat")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },

};

Blockly.Blocks["BlockDesignMTC"] = {
  init: function () {
    this.syntaxType = "mtc";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("mtc")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },
};

Blockly.Blocks["BlockDesignFIELD"] = {
  init: function () {
    this.syntaxType = "field";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("field")
      .setCheck(this.syntaxType)
      .appendField("Out\t \t \tIn");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },
};

Blockly.Blocks["BlockDesignDEC"] = {
  init: function () {
    this.syntaxType = "field";
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendDummyInput("field")
      .appendField("In");
    this.appendDummyInput("field")
      .appendField("Out");

    this.setPreviousStatement(true, this.syntaxType);
    this.setNextStatement(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
  },
};

Blockly.Blocks["BlockNonGrowingVertical"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.expectedChildTermType = { key: "*", value: "'X" }
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("exp")
      .setCheck(this.syntaxType)
      .appendField("Terminal")
      .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "field_color");
    this.setPreviousStatement(true, this.syntaxType);
    this.setNextStatement(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
    this.setCommentText("Text information");
    this.setWarningText("Error/ warning messages");
    this.getField("field_color").setTooltip(prettyPrintTermType(this.expectedChildTermType));
  },
};

Blockly.Blocks["BlockNonGrowingHorizontal"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.expectedChildTermType = { key: "*", value: "'X" }
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendValueInput("exp")
      .setCheck(this.syntaxType)
      .appendField("Terminal")
      .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "field_color");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
    this.setCommentText("Text information");
    this.setWarningText("Error/ warning messages");
    this.getField("field_color").setTooltip(prettyPrintTermType(this.expectedChildTermType));
  },

};

Blockly.Blocks["BlockDesignPTBinOptr"] = {
  init: function () {
    this.syntaxType = "exp";
    this.expectedChildTermType = { key: "*", value: "'X" }
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.setInputsInline(true);

    this.appendValueInput("lhs")
      .setCheck(this.syntaxType)
      .appendField("Terminal")
      .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "field_color_lhs");
    this.appendValueInput("rhs")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .setCheck(this.syntaxType)
      .appendField("operator")
      .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "field_color_rhs");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
    this.setCommentText("Text information");
    this.setWarningText("Error/ warning messages");
  },

};
Blockly.Blocks["BlockDesignPTUnaryOptr"] = {
  init: function () {
    this.syntaxType = "exp";
    this.expectedChildTermType = { key: "*", value: "'X" }
    this.termType = { key: "*", value: "*" };
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.errorText = "";
    this.setInputsInline(true);
    this.appendValueInput("exp")
      .setCheck(this.syntaxType)
      .appendField("Terminal")
      .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "field_color_rhs");
    this.setOutput(true, this.syntaxType);

    this.setColour(getColorByType(this.termType));
    this.setCommentText("Text information");
    this.setWarningText("Error/ warning messages");
  },

};