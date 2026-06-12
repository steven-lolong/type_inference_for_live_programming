/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Parameter - Implicit
 */

import Blockly from "blockly";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { createPlusField } from "../../plugins/plus_minus/field_plus";
import { createMinusField } from "../../plugins/plus_minus/field_minus";
import { hasNameConflict } from "../../seeders/check_name_conflict";
import { mnlWorkspaceId } from "../../core_loader";

Blockly.Blocks["BlockParamImplicit"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.syntaxType = "param";
    this.termType = { key: "primitive", value: "unit" };
    // set the value to empty for program visualization of function value. The value is 'space'.
    this.termValue = undefined;
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";

    this.appendDummyInput("ENDMARKER");
    this.appendDummyInput("EMPTY");
    this.setInputsInline(true);
    this.setColour(getColorByType(this.termType));

    this.setOutput(true, this.syntaxType);
    this.setTooltip("parameter");
    this.jsonInit({
      mutator: ["parameterMutator"],
    });
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      this.updateDisplay();
      return;
    }

    this.isComplete = true;
    this.termValue = undefined;
    this.errorText = "";
    this.termTypeHasNoError = true;
    this.resetTypeToDefault();

    this.isCompleteBlock();

    if (this.getParent()) {
      // this.resetTypeToDefault();
      if (this.isComplete) {
        if (this.itemCount_ > 0) {
          this.termType = this.getParent().termType.value.from;
        } else {
          this.termType = { key: 'primitive', value: 'unit' };
        }
        this.evaluator();
      } else {
        this.resetTypeToDefault();
      }

    }

    this.updateDisplay();

    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },


  evaluator: function () {
    if (this.itemCount_ > 0) {
      this.termType = this.getParent().termType.value.from;
    } else {
      this.termType = { key: "primitive", value: "unit" };
      this.termValue = "()";
    }
  },

  evaluatorVisualization: function () {
    if (this.itemCount_ > 0) {
      this.termType = this.getParent().termType.value.from;
    } else {
      this.termType = { key: "primitive", value: "unit" };
      this.termValue = "()";
    }
  },

  evaluatorVisualizationCBV: function () {
    if (this.itemCount_ > 0) {
      this.termType = this.getParent().termType.value.from;
    } else {
      this.termType = { key: "primitive", value: "unit" };
      this.termValue = "()";
    }
  },

  resetTypeToDefault: function () {
    if (this.itemCount_ > 0) {
      this.termType = { key: "*", value: "*" };
      this.termValue = " ";
    } else {
      this.termType = { key: "primitive", value: "unit" };
      this.termValue = "()";
    }
  },

  updateDisplay: function () {
    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  isCompleteBlock: function () {
    if (this.itemCount_ > 0) {
      let uidBlock = this.getInputTargetBlock("ADD" + 0);
      if (!uidBlock) {
        this.termType = { key: "*", value: "*" };
        this.setColour(getColorByType(this.termType));
        this.isComplete &&= false;
        this.errorText += "- Require an ID block.\n";
      } else {
        if (!uidBlock.isComplete) {
          this.termType = { key: "*", value: "*" };
          this.setColour(getColorByType(this.termType));
          this.isComplete &&= false;
          this.errorText += "- ID block is incomplete.\n";
        } else {
          if (hasNameConflict(this, 3)) {
            this.termType = { key: "*", value: "*" };
            this.setColour(getColorByType(this.termType));
            this.isComplete &&= false;
          }
        }
      }
    }
  },
};

const parameterMutatorConst = {
  /**
   * Number of item inputs the block has.
   * @type {number}
   */
  itemCount_: 0,

  /**
   * Creates XML to represent number of text inputs.
   * @returns {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parses XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_(targetCount);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function () {
    return {
      termType_key: this.termType.key,
      termType_value: this.termType.value,
      itemCount: this.itemCount_,
    };
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.termType.key = state["termType_key"];
    this.termType.value = state["termType_value"];
    this.updateShape_(state["itemCount"]);
  },

  /**
   * Adds inputs to the block until it reaches the target number of inputs.
   * @param {number} targetCount The target number of inputs for the block.
   * @this {Blockly.Block}
   * @private
   */
  updateShape_: function (targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
    this.updatePlus_();
  },

  /**
   * Callback for the plus image. Adds an input to the end of the block and
   * updates the state of the minus.
   */
  plus: function () {
    if (this.itemCount_ > 0) {
      return;
    }
    this.addPart_();
    this.updatePlus_();
  },

  /**
   * Callback for the minus image. Removes an input from the end of the block
   * and updates the state of the minus.
   */
  minus: function () {
    if (this.itemCount_ < 1) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first input to be ADD0 (not ADD1) we increment after.

  /**
   * Adds an input to the end of the block. If the block currently has no
   * inputs it updates the top 'EMPTY' input to receive a block.
   * @this {Blockly.Block}
   * @private
   */
  addPart_: function () {
    if (this.itemCount_ == 0) {
      this.removeInput("EMPTY");
      this.topInput_ = this.appendValueInput("ADD" + this.itemCount_)
        .appendField(createMinusField(), "MINUS")
        .appendField("ID")
        .setCheck("uid");
      this.moveInputBefore("ADD" + this.itemCount_, "ENDMARKER");
    }
    this.itemCount_++;
  },

  /**
   * Removes an input from the end of the block. If we are removing the last
   * input this updates the block to have an 'EMPTY' top input.
   * @this {Blockly.Block}
   * @private
   */
  removePart_: function () {
    if (this.itemCount_ > 0) {
      this.itemCount_--;
      this.removeInput("ADD" + this.itemCount_);
      if (this.itemCount_ == 0) {
        this.topInput_ = this.appendDummyInput("EMPTY")
          .appendField(createPlusField(), "PLUS")
          .appendField("Unit");
      }
    }
  },

  /**
   * Makes it so the minus is visible iff there is an input available to remove.
   * @private
   */
  updateMinus_: function () {
    const minusField = this.getField("MINUS");
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, createMinusField(), "MINUS");
    } else if (minusField && this.itemCount_ < 1) {
      this.topInput_.removeField("MINUS");
    }
  },
  updatePlus_: function () {
    const plusField = this.getField("PLUS");
    if (!plusField && this.itemCount_ < 1) {
      this.topInput_.insertFieldAt(1, createPlusField(), "PLUS");
    } else if (plusField && this.itemCount_ > 0) {
      this.topInput_.removeField("PLUS");
    }
  },
};

/**
 * Updates the shape of the block to have 3 inputs if no mutation is provided.
 * @this {Blockly.Block}
 */
const parameterHelper = function () {
  this.getInput("EMPTY").insertFieldAt(0, createPlusField(), "PLUS");
  this.getInput("EMPTY").appendField("Unit");
  this.updateShape_(0);
};

Blockly.Extensions.registerMutator(
  "parameterMutator",
  parameterMutatorConst,
  parameterHelper
);
