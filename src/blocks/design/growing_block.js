/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Design - Growing Block
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";

const GROWING_BLOCK_DESIGN = {
  /**
   * Block for creating a list with any number of elements of any type.
   */
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "list", value: { key: "*", value: "*" } };

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.expectedChildTermType = { key: "*", value: "'X" };
    this.appendDummyInput("header").appendField("Terminal");
    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(
      new Blockly.icons.MutatorIcon(["DesignGrowingBlock"], this)
    );
    this.setColour(getColorByType(this.termType));
  },
  /**
   * Create XML to represent list inputs.
   * Backwards compatible serialization implementation.
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", String(this.itemCount_));
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * Backwards compatible serialization implementation.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function (xmlElement) {
    const items = xmlElement.getAttribute("items");
    if (!items) throw new TypeError("element did not have items");
    this.itemCount_ = parseInt(items, 10);
    this.updateShape_();
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   *
   * @returns The state of this block, ie the item count.
   */
  saveExtraState: function () {
    return {
      itemCount: this.itemCount_,
    };
  },
  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.itemCount_ = state["itemCount"];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   *
   * @param workspace Mutator's workspace.
   * @returns Root block in mutator.
   */
  decompose: function (workspace) {
    const DesignConstructorGrowingBlock = workspace.newBlock(
      "DesignConstructorGrowing"
    );
    DesignConstructorGrowingBlock.initSvg();
    let connection =
      DesignConstructorGrowingBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const DesignGrowingBlock = workspace.newBlock(
        "DesignGrowingBlock"
      );
      DesignGrowingBlock.initSvg();
      if (!DesignGrowingBlock.previousConnection) {
        throw new Error(
          "DesignGrowingBlock has no previousConnection"
        );
      }
      connection.connect(DesignGrowingBlock.previousConnection);
      connection = DesignGrowingBlock.nextConnection;
    }
    return DesignConstructorGrowingBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param DesignConstructorGrowingBlock Root block in mutator.
   */
  compose: function (DesignConstructorGrowingBlock) {
    let DesignGrowingBlock =
      DesignConstructorGrowingBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (DesignGrowingBlock) {
      if (DesignGrowingBlock.isInsertionMarker()) {
        DesignGrowingBlock =
          DesignGrowingBlock.getNextBlock();
        continue;
      }
      connections.push(DesignGrowingBlock.valueConnection_);
      DesignGrowingBlock =
        DesignGrowingBlock.getNextBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      connections[i]?.reconnect(this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   *
   * @param DesignConstructorGrowingBlock Root block in mutator.
   */
  saveConnections: function (DesignConstructorGrowingBlock) {
    let DesignGrowingBlock =
      DesignConstructorGrowingBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (DesignGrowingBlock) {
      if (DesignGrowingBlock.isInsertionMarker()) {
        DesignGrowingBlock =
          DesignGrowingBlock.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      DesignGrowingBlock.valueConnection_ =
        input?.connection.targetConnection;
      DesignGrowingBlock =
        DesignGrowingBlock.getNextBlock();
      i++;
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField("Empty list");
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("exp");
        input.appendField("Item-" + (i + 1))
          .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "child_color" + i);
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput("ADD" + i); i++) {
      this.removeInput("ADD" + i);
    }
  },
};
Blockly.Blocks["BlockDesignGrowing"] = {
  ...GROWING_BLOCK_DESIGN,
  onchange: function () {
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.setColour(getColorByType(this.termType));
    this.setCommentText("Text information");
    this.setWarningText("Error/ warning messages");
    this.getField("child_color0").setTooltip(prettyPrintTermType(this.expectedChildTermType));
  },

};

const GROWING_BLOCK_DESIGN_CONTAINER_BLOCK = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("List of items");
    this.appendStatementInput("STACK");
    this.setTooltip("List of items");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["DesignConstructorGrowing"] =
  GROWING_BLOCK_DESIGN_CONTAINER_BLOCK;

const GROWING_BLOCK_DESIGN_CONTAINER_ITEM = {
  /**
   * Mutator block for adding items.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Item");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(getColorByType({ key: "*", value: "*" }));
    this.setTooltip("Item");
    this.contextMenu = false;
  },
};
Blockly.Blocks["DesignGrowingBlock"] =
  GROWING_BLOCK_DESIGN_CONTAINER_ITEM;
