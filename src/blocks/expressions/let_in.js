/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression - Let In (special function applicatin)
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { inferringTheTypeBasedOnTheParentBlock } from "../../seeders/type_elaboration/inferring_type_based_on_parent_block";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { mnlWorkspaceId } from "../../core_loader";

const EXP_LET_IN_BLOCK = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;
    this.expectedTermType = { key: "*", value: "*" }; // any type

    this.appendDummyInput("header_let")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Let");

    this.appendStatementInput("declaration").setCheck("dec");

    this.appendDummyInput("header_in")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("in");

    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(new Blockly.icons.MutatorIcon(["ExpLetInItem"], this));

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
      termType_key: this.termType.key,
      termType_value: this.termType.value,
      itemCount: this.itemCount_,
    };
  },
  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.termType.key = state["termType_key"];
    this.termType.value = state["termType_value"];
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
    const LetInContainerBlock = workspace.newBlock("LetInContainer");
    LetInContainerBlock.initSvg();
    let connection = LetInContainerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("ExpLetInItem");
      itemBlock.initSvg();
      if (!itemBlock.previousConnection) {
        throw new Error("Item has no previousConnection");
      }
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return LetInContainerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param LetInContainerBlock Root block in mutator.
   */
  compose: function (LetInContainerBlock) {
    let itemBlock = LetInContainerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock();
        continue;
      }
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.getNextBlock();
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
      // Blockly.Mutator.reconnect(connections[i], this, "ADD" + i);
      connections[i]?.reconnect(this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   *
   * @param LetInContainerBlock Root block in mutator.
   */
  saveConnections: function (LetInContainerBlock) {
    let itemBlock = LetInContainerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input?.connection.targetConnection;
      itemBlock = itemBlock.getNextBlock();
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
      this.appendDummyInput("EMPTY").appendField("Unit");
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("exp");

        input.appendField("Expression-" + (i + 1))
          .appendField(new MnLFieldColor(getColorByType(this.expectedTermType), null, {}), "child_color" + i);
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput("ADD" + i); i++) {
      this.removeInput("ADD" + i);
    }
  },
};

Blockly.Blocks["BlockExpLetIn"] = {
  ...EXP_LET_IN_BLOCK,
  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    if (this.itemCount_ < 1) {
      this.itemCount_ = 1;
      this.updateShape_();
    }

    this.isCompleteBlock();
    if (this.isComplete) {
      if (
        this.isNoErrorOnTermTypeOfChild() &&
        this.isNoErrorOnTermTypeOfChildDec()
      ) {
        this.setTermType();
        if (this.errorText.length === 0) {
          this.evaluator();
        }
      }
    }

    this.updateChildColor();
    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
    // show error messege
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    if (this.itemCount_ > 0) {
      let lastBlock = this.getInputTargetBlock("ADD" + (this.itemCount_ - 1));
      if (lastBlock) {
        this.termValue = lastBlock.termValue;
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualization: function () {
    if (this.itemCount_ > 0) {
      let lastBlock = this.getInputTargetBlock("ADD" + (this.itemCount_ - 1));
      if (lastBlock) {
        this.termValue = lastBlock.termValue;
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    if (this.itemCount_ > 0) {
      let lastBlock = this.getInputTargetBlock("ADD" + (this.itemCount_ - 1));
      if (lastBlock) {
        this.termValue = lastBlock.termValue;
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  updateChildColor: function () {
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        let childColor = this.getField("child_color" + i);
        if (childBlock) {
          childColor.value_ = getColorByType(childBlock.termType);
          childColor.setTooltip(prettyPrintTermType(childBlock.termType));
        } else {
          childColor.value_ = getColorByType(this.expectedTermType);
          childColor.setTooltip(prettyPrintTermType(this.expectedTermType));
        }
      }

      if (!this.getInputTargetBlock("ADD" + (this.itemCount_ - 1)) && this.getParent()) {
        let env = {};
        let typeVarCounter = {
          a: 0,
        };
        const parentTermType = inferringTheTypeBasedOnTheParentBlock(this, this, "", env, typeVarCounter);

        if (parentTermType != "unknown") {
          let colorField = this.getField("child_color" + (this.itemCount_ - 1));
          colorField.value_ = getColorByType(parentTermType);
          colorField.setTooltip(prettyPrintTermType(parentTermType));
        }

      }
    }
  },

  setTermType: function () {
    if (this.itemCount_ > 0) {
      let firstBlock = this.getInputTargetBlock("ADD" + (this.itemCount_ - 1));
      if (firstBlock) {
        this.termType = firstBlock.termType;
      }
    }
  },

  isNoErrorOnTermTypeOfChildDec() {
    let noTermTypeError = true;
    let decChild = this.getInputTargetBlock("declaration");
    let i = 1;
    while (decChild) {
      if (!decChild.termTypeHasNoError) {
        noTermTypeError &&= false;
        this.termTypeHasNoError &&= false;
        this.errorText +=
          "- An error on child-" + i + " in the Let declaration. \n";
      }
      i++;
      decChild = decChild.getNextBlock();
    }
    return noTermTypeError;
  },

  isNoErrorOnTermTypeOfChild() {
    let noTermTypeError = true;
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (!inputBlock.termTypeHasNoError) {
          noTermTypeError &&= false;
          this.termTypeHasNoError &&= false;

          this.errorText +=
            "- The connected block on Expression-" +
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
          this.errorText += "- Require an expression on Expression-" + (i + 1) + ".\n";
        } else {
          if (!inputBlock.isComplete) {
            this.isComplete &&= false;
            this.errorText +=
              "- The expression on Expression-" + (i + 1) + " is incomplete.\n";
          }
        }
      }
    }
  },
};

const EXP_LET_IN_CONTAINER = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Expression(s)");
    this.appendStatementInput("STACK");
    this.setTooltip("Expression(s)");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["LetInContainer"] = EXP_LET_IN_CONTAINER;

const EXP_LET_IN_ITEM = {
  /**
   * Mutator block for adding items.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Expression");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(getColorByType({ key: "exp", value: "*" }));
    this.setTooltip("Expression");
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpLetInItem"] = EXP_LET_IN_ITEM;
