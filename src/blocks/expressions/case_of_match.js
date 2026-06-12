/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression case of match
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { equalityTypeChecker } from "../../seeders/type_elaboration/equality_type_checker";
import { MnLFieldColor } from "../../plugins/field_color/mnl_field_color";
import { mnlWorkspaceId } from "../../core_loader";

const EXP_CASE_OF = {
  /**
   * Block for creating a list with any number of elements of any type.
   */
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;

    this.errorText = "";
    this.termTypeHasNoError = true;
    this.isComplete = true;

    this.expectedSwitchType = { key: "*", value: "*" };
    this.expectedChildTermType = { key: "*", value: "*" };

    this.appendValueInput("switch").setCheck("exp")
      .appendField("Switch")
      .appendField(new MnLFieldColor(getColorByType(this.expectedSwitchType), null, {}), "expected_switch_term_type_color");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "exp");
    this.setMutator(
      new Blockly.icons.MutatorIcon(["ExpCaseOfContainerItem"], this)
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
    const ExpCaseOfContainerBlock = workspace.newBlock("ExpCaseOfContainer");
    ExpCaseOfContainerBlock.initSvg();
    let connection = ExpCaseOfContainerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const ExpCaseOfContainerItem = workspace.newBlock(
        "ExpCaseOfContainerItem"
      );
      ExpCaseOfContainerItem.initSvg();
      if (!ExpCaseOfContainerItem.previousConnection) {
        throw new Error("ExpCaseOfContainerItem has no previousConnection");
      }
      connection.connect(ExpCaseOfContainerItem.previousConnection);
      connection = ExpCaseOfContainerItem.nextConnection;
    }
    return ExpCaseOfContainerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param ExpCaseOfContainerBlock Root block in mutator.
   */
  compose: function (ExpCaseOfContainerBlock) {
    let ExpCaseOfContainerItem =
      ExpCaseOfContainerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (ExpCaseOfContainerItem) {
      if (ExpCaseOfContainerItem.isInsertionMarker()) {
        ExpCaseOfContainerItem = ExpCaseOfContainerItem.getNextBlock();
        continue;
      }
      connections.push(ExpCaseOfContainerItem.valueConnection_);
      ExpCaseOfContainerItem = ExpCaseOfContainerItem.getNextBlock();
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
   * @param ExpCaseOfContainerBlock Root block in mutator.
   */
  saveConnections: function (ExpCaseOfContainerBlock) {
    let ExpCaseOfContainerItem =
      ExpCaseOfContainerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (ExpCaseOfContainerItem) {
      if (ExpCaseOfContainerItem.isInsertionMarker()) {
        ExpCaseOfContainerItem = ExpCaseOfContainerItem.getNextBlock();
        continue;
      }
      const input = this.getInput("ADD" + i);
      ExpCaseOfContainerItem.valueConnection_ =
        input?.connection.targetConnection;
      ExpCaseOfContainerItem = ExpCaseOfContainerItem.getNextBlock();
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
        .appendField("Empty Case");
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("mtc");

        input.appendField("Case-" + (i + 1));
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput("ADD" + i); i++) {
      this.removeInput("ADD" + i);
    }
  },
};

Blockly.Blocks["BlockExpCaseOf"] = {
  ...EXP_CASE_OF,
  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    if (this.itemCount_ < 2) {
      this.itemCount_ = 2;
      this.updateShape_();
    }
    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;
    this.expectedSwitchType = { key: "*", value: "*" };
    this.expectedChildTermType = { key: "*", value: "*" };
    if (this.getField("expected_switch_term_type_color")) {
      this.getField("expected_switch_term_type_color").value_ = getColorByType(this.expectedSwitchType);
    }

    this.guessTheExpectedSwitchType();
    this.guessTheExpectedTermType();
    this.triggerOnchangeOfMTCBlock();
    if (this.itemCount_ > 0) {
      this.isCompleteBlock();
      if (this.isComplete) {
        if (this.isNoErrorOnTermTypeOfChild()) {
          this.isSwitchAndPatterEqual();
          this.isChildTermTypeEqual();
          this.setTermType();

          if (this.errorText.length === 0) {
            this.evaluator();
          }

        }
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
    let blockSwitch = this.getInputTargetBlock("switch");
    if (blockSwitch) {
      let switch_val = blockSwitch.termValue;
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (inputBlock) {
          let input_pat_val = inputBlock.termValue.pat;
          let input_exp_val = inputBlock.termValue.exp;
          let patBlock = inputBlock.getInputTargetBlock("pattern");
          if (patBlock) {
            if (patBlock.type == "BlockPatternConstAnyValue") {
              this.termValue = input_exp_val;
              if (mnlWorkspaceId != this.workspace.id) {
                this.setTermType();
              }
              return;
            } else {
              if (input_pat_val == switch_val) {
                this.termValue = input_exp_val;
                if (mnlWorkspaceId != this.workspace.id) {
                  this.setTermType();
                }
                return;
              }
            }
          }
        }
      }
    }

  },

  evaluatorVisualization: function () {
    let blockSwitch = this.getInputTargetBlock("switch");
    if (blockSwitch) {
      let switch_val = blockSwitch.termValue;
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (inputBlock) {
          let input_pat_val = inputBlock.termValue.pat;
          let input_exp_val = inputBlock.termValue.exp;
          let patBlock = inputBlock.getInputTargetBlock("pattern");
          if (patBlock) {
            if (patBlock.type == "BlockPatternConstAnyValue") {
              this.termValue = input_exp_val;
              if (mnlWorkspaceId == this.workspace.id) {
                this.setTermType();
              }
              return;
            } else {
              if (input_pat_val == switch_val) {
                this.termValue = input_exp_val;
                if (mnlWorkspaceId == this.workspace.id) {
                  this.setTermType();
                }
                return;
              }
            }
          }
        }
      }
    }

  },

  evaluatorVisualizationCBV: function () {
    let blockSwitch = this.getInputTargetBlock("switch");
    if (blockSwitch) {
      let switch_val = blockSwitch.termValue;
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (inputBlock) {
          let input_pat_val = inputBlock.termValue.pat;
          let input_exp_val = inputBlock.termValue.exp;
          let patBlock = inputBlock.getInputTargetBlock("pattern");
          if (patBlock) {
            if (patBlock.type == "BlockPatternConstAnyValue") {
              this.termValue = input_exp_val;
              if (mnlWorkspaceId == this.workspace.id) {
                this.setTermType();
              }
              return;
            } else {
              if (input_pat_val == switch_val) {
                this.termValue = input_exp_val;
                if (mnlWorkspaceId == this.workspace.id) {
                  this.setTermType();
                }
                return;
              }
            }
          }
        }
      }
    }

  },

  triggerOnchangeOfMTCBlock: function () {
    for (let i = 0; i < this.itemCount_; i++) {
      let inputBlock = this.getInputTargetBlock("ADD" + i);
      if (inputBlock) {
        inputBlock.onchange();
      }
    }
  },

  guessTheExpectedSwitchType: function () {
    const inputSwitchBlock = this.getInputTargetBlock("switch");
    let isFound = false;
    if (!inputSwitchBlock) {
      // input in switch is empty
      if (this.itemCount_) {
        for (let i = 0; i < this.itemCount_; i++) {
          let inputBlock = this.getInputTargetBlock("ADD" + i);
          if (inputBlock) {
            let blockPattern = inputBlock.getInputTargetBlock("pattern");
            if (blockPattern && !isFound) {
              this.getField("expected_switch_term_type_color").value_ = getColorByType(blockPattern.termType);
              this.expectedSwitchType = blockPattern.termType;
              isFound = true;
              break;
            }
          }
        }
      }
    } else {
      this.getField("expected_switch_term_type_color").value_ = getColorByType(inputSwitchBlock.termType);
      this.expectedSwitchType = inputSwitchBlock.termType;
    }

  },

  guessTheExpectedTermType: function () {
    for (let i = 0; i < this.itemCount_; i++) {
      let inputBlock = this.getInputTargetBlock("ADD" + i);
      let isFound = false;
      if (inputBlock) {
        let expBlock = inputBlock.getInputTargetBlock("exp");
        if (expBlock && !isFound && expBlock.termTypeHasNoError) {
          this.expectedChildTermType = expBlock.termType;
          isFound = true;
          break;
        }
      }
    }
  },

  setTermType: function () {
    let realType = null;
    let varType = null;
    for (let i = 0; i < this.itemCount_; i++) {
      let theChild = this.getInputTargetBlock("ADD" + i);
      if (theChild.termType != undefined) {
        if (theChild.termType.value.exp.key != "*") {
          realType = theChild.termType.value.exp;
          break;
        } else {
          varType = theChild.termType.value.exp;
        }
      }
    }

    this.termType = (realType != null ? realType : varType);
  },


  isSwitchAndPatterEqual() {
    let blockSwitch = this.getInputTargetBlock("switch");
    let patTypeMatch = true;
    for (let i = 0; i < this.itemCount_; i++) {
      let firstBlock = this.getInputTargetBlock("ADD" + i);
      if (firstBlock) {
        if (
          firstBlock.termType.value.pat.key == "*" &&
          firstBlock.termType.value.pat.value == "*"
        ) {
          patTypeMatch &= true;
        }
        else {
          patTypeMatch &= equalityTypeChecker(firstBlock.termType.value.pat, blockSwitch.termType)
        }
      }

    }

    if (!patTypeMatch) {
      // this.termTypeHasNoError = false;
      this.errorText +=
        "- The term type on Switch does not match with the term type on Case Pattern .\n";
    }
    return patTypeMatch;
  },

  isChildTermTypeEqual() {
    let allIsHaveEqualTermType = true;
    if (this.itemCount_ > 1) {
      for (let i = 1; i < this.itemCount_; i++) {
        let firstBlock = this.getInputTargetBlock("ADD" + (i - 1));
        let secondBlock = this.getInputTargetBlock("ADD" + i);
        if (!equalityTypeChecker(firstBlock.termType, secondBlock.termType)) {
          allIsHaveEqualTermType &&= false;
          // this.termTypeHasNoError &&= false;
          this.errorText +=
            "- The term type on Case-" +
            i +
            " does not match with the term type on Case-" +
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
            "- The connected block on Case-" +
            (i + 1) +
            " has a term type error.\n";
        }
      }
    }
    return noTermTypeError;
  },

  isCompleteBlock: function () {
    let switchBlock = this.getInputTargetBlock("switch");
    if (!switchBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require a expression block on Switch.\n";
    }
    if (this.itemCount_ > 0) {
      for (let i = 0; i < this.itemCount_; i++) {
        let inputBlock = this.getInputTargetBlock("ADD" + i);
        if (!inputBlock) {
          this.isComplete &&= false;
          this.errorText += "- Require a do-block on case-" + (i + 1) + ".\n";
        } else {
          if (!inputBlock.isComplete) {
            this.isComplete &&= false;
            this.errorText += "- The case-" + (i + 1) + " is incomplete.\n";
          }
        }
      }
    }
  },
};

const EXP_CASE_OF_CONTAINER_BLOCK = {
  /**
   * Mutator block for list container.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Cases");
    this.appendStatementInput("STACK");
    this.setTooltip("Cases");
    this.setColour(getColorByType({ key: "exps", value: "*" }));
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpCaseOfContainer"] = EXP_CASE_OF_CONTAINER_BLOCK;

const EXP_CASE_OF_CONTAINER_ITEM = {
  /**
   * Mutator block for adding items.
   */
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Case");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(getColorByType({ key: "*", value: "*" }));
    this.setTooltip("Case");
    this.contextMenu = false;
  },
};
Blockly.Blocks["ExpCaseOfContainerItem"] = EXP_CASE_OF_CONTAINER_ITEM;
