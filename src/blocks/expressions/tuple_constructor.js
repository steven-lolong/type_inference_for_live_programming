/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression - Tuple constructor
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { inferringTheTypeBasedOnTheParentBlock } from "../../seeders/type_elaboration/inferring_type_based_on_parent_block";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { mnlWorkspaceId } from "../../core_loader";

const EXP_TUPLE_CONSTRUCTOR = {
  /**
   * Block for creating a  with any tuple number of elements of any type.
   */
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "tuple", value: { key: "*", value: "*" } };
    this.termValue = {};

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.expectedChildTermType = { key: "*", value: "*" };
    this.appendDummyInput("header").appendField("Tuple constructor");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(
      new Blockly.icons.MutatorIcon(["ExpTupleConstructorContainerItem"], this)
    );
    this.setColour(getColorByType(this.termType));
  },
  /**
   * Create XML to represent tuple inputs.
   * Backwards compatible serialization implementation.
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", String(this.itemCount_));
    return container;
  },
  /**
   * Parse XML to restore the tuple inputs.
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
      termType_key: this.termType.key,
      termType_value: this.termType.value,
    };
  },
  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.itemCount_ = state["itemCount"];
    this.termType.key = state["termType_key"];
    this.termType.value = state["termType_value"];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   *
   * @param workspace Mutator's workspace.
   * @returns Root block in mutator.
   */
  decompose: function (workspace) {
    const ExpTupleConstructorContainerBlock = workspace.newBlock(
      "ExpTupleConstructorContainer"
    );
    ExpTupleConstructorContainerBlock.initSvg();
    let connection =
      ExpTupleConstructorContainerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const ExpTupleConstructorContainerItem = workspace.newBlock(
        "ExpTupleConstructorContainerItem"
      );
      ExpTupleConstructorContainerItem.initSvg();
      if (!ExpTupleConstructorContainerItem.previousConnection) {
        throw new Error(
          "ExpTupleConstructorContainerItem has no previousConnection"
        );
      }
      connection.connect(ExpTupleConstructorContainerItem.previousConnection);
      connection = ExpTupleConstructorContainerItem.nextConnection;
    }
    return ExpTupleConstructorContainerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param ExpTupleConstructorContainerBlock Root block in mutator.
   */
  compose: function (ExpTupleConstructorContainerBlock) {
    let ExpTupleConstructorContainerItem =
      ExpTupleConstructorContainerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (ExpTupleConstructorContainerItem) {
      if (ExpTupleConstructorContainerItem.isInsertionMarker()) {
        ExpTupleConstructorContainerItem =
          ExpTupleConstructorContainerItem.getNextBlock();
        continue;
      }
      connections.push(ExpTupleConstructorContainerItem.valueConnection_);
      ExpTupleConstructorContainerItem =
        ExpTupleConstructorContainerItem.getNextBlock();
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
   * @param ExpTupleConstructorContainerBlock Root block in mutator.
   */
  saveConnections: function (ExpTupleConstructorContainerBlock) {
    let ExpTupleConstructorContainerItem =
      ExpTupleConstructorContainerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (ExpTupleConstructorContainerItem) {
      if (ExpTupleConstructorContainerItem.isInsertionMarker()) {
        ExpTupleConstructorContainerItem =
          ExpTupleConstructorContainerItem.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      ExpTupleConstructorContainerItem.valueConnection_ =
        input?.connection.targetConnection;
      ExpTupleConstructorContainerItem =
        ExpTupleConstructorContainerItem.getNextBlock();
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
        .appendField("Empty tuple");
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("exp");
        input.appendField("Inhabitant-" + (i + 1))
          .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "child_color" + i);
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput("ADD" + i); i++) {
      this.removeInput("ADD" + i);
    }
  },
};

Blockly.Blocks["BlockExpTupleConstructor"] = {
  ...EXP_TUPLE_CONSTRUCTOR,
  onchange: function () {

    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    if (this.itemCount_ < 1) {
      this.itemCount_ = 1;
      this.updateShape_();
    }
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "tuple", value: { key: "*", value: "*" } };
    this.termValue = {};

    if (this.itemCount_ > 0) {
      this.isCompleteBlock();
      if (this.isComplete) {
        this.setTermType();

        if (this.errorText.length === 0) {
          this.evaluator();
        }

      }
    }

    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    this.updateResetChildColor();
    this.suggestionChildFieldColor();
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },


  evaluator: function () {
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          this.termValue[(i + 1).toString()] = childBlock.termValue;

        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualization: function () {
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          this.termValue[(i + 1).toString()] = childBlock.termValue;

        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          this.termValue[(i + 1).toString()] = childBlock.termValue;

        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  updateResetChildColor: function () {
    for (let i = 0; i < this.itemCount_; i++) {
      let childBlock = this.getInputTargetBlock("ADD" + i);
      let childColor = this.getField("child_color" + i);
      if (childBlock) {
        childColor.value_ = getColorByType(childBlock.termType);
        childColor.setTooltip(prettyPrintTermType(childBlock.termType));
      } else {
        childColor.value_ = getColorByType(this.expectedChildTermType);
        childColor.setTooltip(prettyPrintTermType(this.expectedChildTermType));
      }
      childColor.applyColour();
    }
  },

  suggestionChildFieldColor: function () {
    let parentBlock = this.getParent();
    if (parentBlock) {
      let env = {};
      let typeVarCounter = {
        a: -1,
      };
      const parentTermType = inferringTheTypeBasedOnTheParentBlock(this, this, "", env, typeVarCounter);

      if (parentTermType != "unknown") {
        if (parentBlock.type == "BlockOperatorTupleGetItem") {
          let targetFieldColor = this.getField("child_color" + (parentBlock.getFieldValue("itemN") - 1));
          if (targetFieldColor) {
            targetFieldColor.value_ = getColorByType(parentTermType);
            targetFieldColor.setTooltip(prettyPrintTermType(parentTermType));
            targetFieldColor.applyColour();
          }
        } else {
          if (parentTermType.key == "tuple" && parentTermType.value != "unknown") {
            if (Object.keys(parentTermType.value).length == this.itemCount_) {
              this.updateSuggestionChildFieldColor(parentTermType);
            } else {
              this.itemCount_ = Object.keys(parentTermType.value).length;
              this.updateShape_();
              this.updateSuggestionChildFieldColor(parentTermType);
            }
          }
        }

      }
    }
  },

  updateSuggestionChildFieldColor: function (suggestTermType) {
    for (let itemName in suggestTermType.value) {
      let childFieldColor = this.getField("child_color" + (itemName - 1));
      if (childFieldColor) {
        childFieldColor.value_ = getColorByType(suggestTermType.value[(itemName)]);
        childFieldColor.setTooltip(prettyPrintTermType(suggestTermType.value[(itemName)]));
        childFieldColor.applyColour();
      }
    }
  },

  setTermType: function () {
    this.termType.key = "tuple";
    this.termType.value = {};
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          if (childBlock.termType !== undefined) {
            this.termType.value[(i + 1).toString()] = childBlock.termType;
          }
        }
      }
    }
  },

  isNoErrorOnTermTypeOfChild() {
    let noTermTypeError = true;
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (!inputBlock.termTypeHasNoError) {
          noTermTypeError &&= false;
          this.errorText +=
            "- The connected block on inhabitant-" +
            (i + 1) +
            " has a term type error.\n";
        }
      }
    }
    return noTermTypeError;
  },

  isCompleteBlock: function () {
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (!inputBlock) {
          this.isComplete &&= false;
          this.errorText +=
            "- Require an expression on inhabitant-" + (i + 1) + ".\n";
        } else {
          if (!inputBlock.isComplete) {
            this.isComplete &&= false;
            this.errorText +=
              "- The expression on inhabitant-" + (i + 1) + " is incomplete.\n";
          }
        }
      }
    }
  },
};

const EXP_TUPLE_CONSTRUCTOR_CONTAINER_BLOCK = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Tuple constructor");
    this.appendStatementInput("STACK");
    this.setTooltip("Tuple constructor");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpTupleConstructorContainer"] =
  EXP_TUPLE_CONSTRUCTOR_CONTAINER_BLOCK;

const EXP_TUPLE_CONSTRUCTOR_CONTAINER_ITEM = {
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
Blockly.Blocks["ExpTupleConstructorContainerItem"] =
  EXP_TUPLE_CONSTRUCTOR_CONTAINER_ITEM;
