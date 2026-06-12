/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression - Record constructor
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { getName } from "../../seeders/get_function_name";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { prettyPrintTermType } from "../../seeders/pretty_print_term_type";
import { inferringTheTypeBasedOnTheParentBlock } from "../../seeders/type_elaboration/inferring_type_based_on_parent_block";
import { mnlWorkspaceId } from "../../core_loader";

const EXP_RECORD_CONSTRUCTOR = {
  /**
   * Block for creating a record with any number of elements of any type.
   */
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "record", value: { key: "*", value: "*" } };
    this.termValue = {};

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.expectedChildTermType = { key: "*", value: "*" };
    this.appendDummyInput("header").appendField("Record constructor");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(
      new Blockly.icons.MutatorIcon(["ExpRecordConstructorContainerItem"], this)
    );
    this.setColour(getColorByType(this.termType));
  },
  /**
   * Create XML to represent record inputs.
   * Backwards compatible serialization implementation.
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", String(this.itemCount_));
    return container;
  },
  /**
   * Parse XML to restore the record inputs.
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
    const ExpRecordConstructorContainerBlock = workspace.newBlock(
      "ExpRecordConstructorContainer"
    );
    ExpRecordConstructorContainerBlock.initSvg();
    let connection =
      ExpRecordConstructorContainerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const ExpRecordConstructorContainerItem = workspace.newBlock(
        "ExpRecordConstructorContainerItem"
      );
      ExpRecordConstructorContainerItem.initSvg();
      if (!ExpRecordConstructorContainerItem.previousConnection) {
        throw new Error(
          "ExpRecordConstructorContainerItem has no previousConnection"
        );
      }
      connection.connect(ExpRecordConstructorContainerItem.previousConnection);
      connection = ExpRecordConstructorContainerItem.nextConnection;
    }
    return ExpRecordConstructorContainerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param ExpRecordConstructorContainerBlock Root block in mutator.
   */
  compose: function (ExpRecordConstructorContainerBlock) {
    let ExpRecordConstructorContainerItem =
      ExpRecordConstructorContainerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (ExpRecordConstructorContainerItem) {
      if (ExpRecordConstructorContainerItem.isInsertionMarker()) {
        ExpRecordConstructorContainerItem =
          ExpRecordConstructorContainerItem.getNextBlock();
        continue;
      }
      connections.push(ExpRecordConstructorContainerItem.valueConnection_);
      ExpRecordConstructorContainerItem =
        ExpRecordConstructorContainerItem.getNextBlock();
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
   * @param ExpRecordConstructorContainerBlock Root block in mutator.
   */
  saveConnections: function (ExpRecordConstructorContainerBlock) {
    let ExpRecordConstructorContainerItem =
      ExpRecordConstructorContainerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (ExpRecordConstructorContainerItem) {
      if (ExpRecordConstructorContainerItem.isInsertionMarker()) {
        ExpRecordConstructorContainerItem =
          ExpRecordConstructorContainerItem.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      ExpRecordConstructorContainerItem.valueConnection_ =
        input?.connection.targetConnection;
      ExpRecordConstructorContainerItem =
        ExpRecordConstructorContainerItem.getNextBlock();
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
        .appendField("Empty Record");
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("field");
        input.appendField("Field-" + (i + 1), "field_" + i)
          .appendField(new MnLFieldColor(getColorByType(this.expectedChildTermType), null, {}), "child_color" + i);
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput("ADD" + i); i++) {
      this.removeInput("ADD" + i);
    }
  },
};

Blockly.Blocks["BlockExpRecordConstructor"] = {
  ...EXP_RECORD_CONSTRUCTOR,
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
    this.termType = { key: "record", value: { key: "*", value: "*" } };
    this.termValue = {};
    this.suggestionTermType = [];

    if (this.itemCount_ > 0) {
      this.isCompleteBlock();
      if (this.isComplete) {
        if (this.isNoErrorOnTermTypeOfChild) {
          this.setTermType();

          if (this.errorText.length === 0) {
            this.evaluator();
          }
        }
      }
    }

    this.setColour(getColorByType(this.termType));
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));

    this.nameCollisionDetection();
    this.updateFieldName();
    this.updateChildColor();
    this.updateSuggestionChildFieldColor();
    // show error message
    if (this.errorText.length === 0) {
      this.setWarningText(null);
    } else {
      this.setWarningText(this.errorText);
    }
  },

  evaluator: function () {
    this.termType.key = "record";
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          // 5 = field code for getName
          this.termValue[getName(childBlock, 5)] =
            childBlock.termValue.fValue;
        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  evaluatorVisualization: function () {
    this.termType.key = "record";
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          // 5 = field code for getName
          this.termValue[getName(childBlock, 5)] =
            childBlock.termValue.fValue;
        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
    this.updateSuggestionChildFieldColor();
  },

  evaluatorVisualizationCBV: function () {
    this.termType.key = "record";
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          // 5 = field code for getName
          this.termValue[getName(childBlock, 5)] =
            childBlock.termValue.fValue;
        }
      }
      if (mnlWorkspaceId != this.workspace.id) {
        this.setTermType();
      }
    }
  },

  updateFieldName: function () {
    let n = 1;
    for (let i = 0; i < this.itemCount_; i++) {
      if (this.getInputTargetBlock("ADD" + i)) {
        this.setFieldValue("Field", "field_" + i);
      } else {
        this.setFieldValue("Field-" + n, "field_" + i);
        n++;
      }
    }
  },

  updateChildColor: function () {
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

  updateSuggestionChildFieldColor: function () {
    let parentBlock = this.getParent();
    if (parentBlock) {
      let env = {};
      let typeVarCounter = {
        a: -1,
      };
      const parentTermType = inferringTheTypeBasedOnTheParentBlock(this, this, "", env, typeVarCounter);

      if (parentTermType != "unknown") {
        if (parentBlock.type == "BlockOperatorRecordGetField") {
          let parentFieldName = parentBlock.getFieldValue("fieldN");
          for (let i = 0; i < this.itemCount_; i++) {
            const fieldBlock = this.getInputTargetBlock("ADD" + i);
            if (fieldBlock) {
              let nameOnChild = getName(fieldBlock, 5);
              if (parentFieldName == nameOnChild) {
                let targetFieldColor = this.getField("child_color" + i);
                this.suggestionTermType[parentFieldName] = parentTermType;
                const newFieldTermType = {
                  key: "field",
                  value: { fName: parentFieldName, fValue: parentTermType },
                }
                targetFieldColor.value_ = getColorByType(newFieldTermType);
                targetFieldColor.setTooltip(prettyPrintTermType(newFieldTermType));
                targetFieldColor.applyColour();
              }
            }
          }
        } else {
          if (parentTermType.key == "record" && parentTermType.value != "unknown") {
            if (Object.keys(parentTermType.value).length > this.itemCount_) {
              this.itemCount_ = Object.keys(parentTermType.value).length;
            }
            this.buildSuggestionTermType(parentTermType.value);
            this.setSuggestionColor();
          }
        }
      }
    }
  },

  setSuggestionColor: function () {
    for (let i = 0; i < this.itemCount_; i++) {
      let childBlock = this.getInputTargetBlock("ADD" + i);
      if (childBlock) {
        let childFieldName = getName(childBlock, 5);
        if (this.suggestionTermType[childFieldName] !== undefined) {
          let targetFieldColor = this.getField("child_color" + i);
          targetFieldColor.value_ = getColorByType(this.suggestionTermType[childFieldName]);
          targetFieldColor.setTooltip(prettyPrintTermType(this.suggestionTermType[childFieldName]));
          targetFieldColor.applyColour();
        }
      }
    }
  },

  buildSuggestionTermType: function (newTermType) {
    for (const name_ in newTermType) {
      this.suggestionTermType[name_] = newTermType[name_];
    }
  },

  setTermType() {
    this.termType.key = "record";
    this.termType.value = {};
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let childBlock = this.getInputTargetBlock("ADD" + i);
        if (childBlock) {
          if (childBlock.termType !== undefined) {
            // 5 = field code for getName
            this.termType.value[getName(childBlock, 5)] =
              childBlock.termType.value.fValue;
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
            "- The connected block on field " +
            this.getFieldName(i) +
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
            "- Require an expression on field " + this.getFieldName(i) + ".\n";
        } else {
          if (!inputBlock.isComplete) {
            this.isComplete &&= false;
            this.errorText +=
              "- The expression on field " + this.getFieldName(i) + " is incomplete.\n";
          }
        }
      }
    }
  },

  nameCollisionDetection: function () {
    for (let i = 0; i < this.itemCount_; i++) {
      for (let j = i + 1; j < this.itemCount_; j++) {
        let block_i = this.getInputTargetBlock("ADD" + i);
        let block_j = this.getInputTargetBlock("ADD" + j);
        if (getName(block_i, 5) == getName(block_j, 5)) {
          this.errorText +=
            "- Name collision: " + getName(block_i, 5) + ".\n";
        }
      }
    }
  },

  getFieldName: function (n) {
    let inputBlock = this.getInputTargetBlock("ADD" + n);
    if (inputBlock) {
      return getName(inputBlock, 5);
    }
    return n + 1;
  }
};

const EXP_RECORD_CONSTRUCTOR_CONTAINER_BLOCK = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Record constructor");
    this.appendStatementInput("STACK");
    this.setTooltip("Record constructor");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpRecordConstructorContainer"] =
  EXP_RECORD_CONSTRUCTOR_CONTAINER_BLOCK;

const EXP_RECORD_CONSTRUCTOR_CONTAINER_ITEM = {
  /**
   * Mutator block for adding items.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Field");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(getColorByType({ key: "*", value: "*" }));
    this.setTooltip("Field");
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpRecordConstructorContainerItem"] =
  EXP_RECORD_CONSTRUCTOR_CONTAINER_ITEM;
