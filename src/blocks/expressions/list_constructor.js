/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression - List constructor
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { inputTermTypeChecker } from "../../seeders/input_term_type_checker";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { inferringTheTypeBasedOnTheParentBlock } from "../../seeders/type_elaboration/inferring_type_based_on_parent_block";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { mnlWorkspaceId } from "../../core_loader";

const EXP_LIST_CONSTRUCTOR = {
  /**
   * Block for creating a list with any number of elements of any type.
   */
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "list", value: { key: "*", value: "*" } };
    this.termValue = [];

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.expectedChildTermType = { key: "*", value: "*" };
    this.appendDummyInput("header").appendField("List constructor");
    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(
      new Blockly.icons.MutatorIcon(["ExpListConstructorContainerItem"], this)
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
    const ExpListConstructorContainerBlock = workspace.newBlock(
      "ExpListConstructorContainer"
    );
    ExpListConstructorContainerBlock.initSvg();
    let connection =
      ExpListConstructorContainerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const ExpListConstructorContainerItem = workspace.newBlock(
        "ExpListConstructorContainerItem"
      );
      ExpListConstructorContainerItem.initSvg();
      if (!ExpListConstructorContainerItem.previousConnection) {
        throw new Error(
          "ExpListConstructorContainerItem has no previousConnection"
        );
      }
      connection.connect(ExpListConstructorContainerItem.previousConnection);
      connection = ExpListConstructorContainerItem.nextConnection;
    }
    return ExpListConstructorContainerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param ExpListConstructorContainerBlock Root block in mutator.
   */
  compose: function (ExpListConstructorContainerBlock) {
    let ExpListConstructorContainerItem =
      ExpListConstructorContainerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (ExpListConstructorContainerItem) {
      if (ExpListConstructorContainerItem.isInsertionMarker()) {
        ExpListConstructorContainerItem =
          ExpListConstructorContainerItem.getNextBlock();
        continue;
      }
      connections.push(ExpListConstructorContainerItem.valueConnection_);
      ExpListConstructorContainerItem =
        ExpListConstructorContainerItem.getNextBlock();
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
   * @param ExpListConstructorContainerBlock Root block in mutator.
   */
  saveConnections: function (ExpListConstructorContainerBlock) {
    let ExpListConstructorContainerItem =
      ExpListConstructorContainerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (ExpListConstructorContainerItem) {
      if (ExpListConstructorContainerItem.isInsertionMarker()) {
        ExpListConstructorContainerItem =
          ExpListConstructorContainerItem.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      ExpListConstructorContainerItem.valueConnection_ =
        input?.connection.targetConnection;
      ExpListConstructorContainerItem =
        ExpListConstructorContainerItem.getNextBlock();
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

Blockly.Blocks["BlockExpListConstructor"] = {
  ...EXP_LIST_CONSTRUCTOR,
  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "list", value: { key: "*", value: "*" } };
    this.termValue = [];


    this.resetChildFieldColor();
    this.updatingSuggestionChildColor();

    this.isCompleteBlock();
    if (this.isComplete) {
      if (this.isNoErrorOnTermTypeOfChild()) {
        this.isChildTermTypeEqual();
        this.setTermType();

        if (this.errorText.length === 0) {
          this.evaluator();
        }

        this.updatingChildFieldColor(this.termType.value);
      }
    }

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
    let list_val = [];
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let the_child = this.getInputTargetBlock("ADD" + i);
        if (the_child) {
          list_val.push(the_child.termValue);
        }
      }
    }
    this.termValue = list_val;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
    }
  },

  evaluatorVisualization: function () {
    let list_val = [];
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let the_child = this.getInputTargetBlock("ADD" + i);
        if (the_child) {

          list_val.push(the_child.termValue);
        }
      }
    }
    this.termValue = list_val;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
    }
  },

  evaluatorVisualizationCBV: function () {
    let list_val = [];
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let the_child = this.getInputTargetBlock("ADD" + i);
        if (the_child) {

          list_val.push(the_child.termValue);
        }
      }
    }
    this.termValue = list_val;
    if (mnlWorkspaceId != this.workspace.id) {
      this.setTermType();
    }
  },

  resetChildFieldColor: function () {
    if (this.itemCount_ > 0) {

      let isTypeFound = false, childType = { key: "*", value: "*" };
      // catch the type 

      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock && childBlock.termTypeHasNoError && !isTypeFound) {
          childType = childBlock.termType;
          isTypeFound = true;
          break;
        }
      }
      this.updatingChildFieldColor(childType);
    }
  },

  updatingSuggestionChildColor: function () {
    if (this.itemCount_ > 0) {
      let parentBlock = this.getParent();
      if (parentBlock) {
        let childType = { key: "*", value: "*" };
        // try to inferr from parent
        let env = {};
        let typeVarCounter = {
          a: 0,
        };
        const parentTermType = inferringTheTypeBasedOnTheParentBlock(this, this, "", env, typeVarCounter);
        if (parentTermType != "unknown") {
          if (parentBlock.type == "BlockOperatorListHead") {
            childType = parentTermType;
          } else if (parentBlock.type == "BlockOperatorListAppend") {
            let blockAppendItemLhs = parentBlock.getInputTargetBlock("lhs");
            if (blockAppendItemLhs) {
              childType = blockAppendItemLhs.termType;
            } else {
              if (parentTermType.key == "list" && parentTermType.value != "unknown") {
                childType = parentTermType.value;
              }
            }
          }
          else {
            if (parentTermType.key == "list" && parentTermType.value != "unknown") {
              childType = parentTermType.value;
            }
          }

        }
        // updating child suggestion field color 
        this.updatingChildFieldColor(childType);
      }

    }
  },

  updatingChildFieldColor: function (termType_) {
    for (let i = 0; i < this.itemCount_; i++) {
      let childColor = this.getField("child_color" + i);
      childColor.value_ = getColorByType(termType_);
      childColor.setTooltip(prettyPrintTermType(termType_));
      childColor.applyColour();
    }
  },

  setTermType() {
    let takeFromNonTypeVar = true;
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock && childBlock.termType.key != "*") {
          this.termType = { key: "list", value: childBlock.termType };
          takeFromNonTypeVar = false;
          break;
        }
      }
      if (takeFromNonTypeVar) {
        for (let i = 0; i < this.itemCount_; i++) {
          let childBlock = this.getInputTargetBlock("ADD" + i);
          if (childBlock) {
            this.termType = { key: "list", value: childBlock.termType };
            break;
          }
        }
      }
    }
  },

  isChildTermTypeEqual() {
    let allIsHaveEqualTermType = true;
    if (this.itemCount_ > 1) {
      for (let i = 1; i < this.itemCount_; i++) {
        let firstBlock = this.getInputTargetBlock("ADD" + (i - 1));
        let secondBlock = this.getInputTargetBlock("ADD" + i);
        if (!inputTermTypeChecker(firstBlock.termType, secondBlock.termType)) {
          allIsHaveEqualTermType &&= false;
          // this.termTypeHasNoError &&= false;
          this.errorText +=
            "- The term type on inhabitant-" +
            i +
            " does not match with the term type on inhabitant-" +
            (i + 1) +
            ".\n";
        }
      }
    }
    return allIsHaveEqualTermType;
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

const EXP_LIST_CONSTRUCTOR_CONTAINER_BLOCK = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("List constructor");
    this.appendStatementInput("STACK");
    this.setTooltip("List constructor");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpListConstructorContainer"] =
  EXP_LIST_CONSTRUCTOR_CONTAINER_BLOCK;

const EXP_LIST_CONSTRUCTOR_CONTAINER_ITEM = {
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
Blockly.Blocks["ExpListConstructorContainerItem"] =
  EXP_LIST_CONSTRUCTOR_CONTAINER_ITEM;
