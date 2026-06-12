/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Expression bound
 */

import Blockly from "blockly/core";
import { getColorByType } from "../../seeders/color_definitions";
import { formattingComment } from "../../seeders/formatting_comment";
import { searchABlockToBind } from "../../seeders/type_elaboration/search_a_block_to_bind";
import { mnlWorkspaceId, mnlWorkspace, evalVisualizationWorkspace, evalVisualizationWorkspaceCBV, evalWorkspace } from "../../core_loader";

Blockly.Blocks["BlockExpBound"] = {
  init: function () {
    this.syntaxType = "exp";
    this.termType = { key: "*", value: "*" };
    this.termValue = undefined;
    this.parentST = "";
    this.boundedSourceID = '';

    this.errorText = "";
    this.isComplete = true;
    this.termTypeHasNoError = true;

    this.appendValueInput("uidBlock")
      .setCheck("uid")
      .appendField("Bound", "terminal");
    this.setOutput(true, this.syntaxType);
    this.setColour(getColorByType(this.termType));

    this.setWarningText(null);
    this.setCommentText(formattingComment(this.syntaxType, this.termType, this.termValue));
  },

  onchange: function () {
    if (mnlWorkspaceId != this.workspace.id) {
      return;
    }

    this.isComplete = true;
    this.termTypeHasNoError = true;
    this.errorText = "";
    this.termType = { key: "*", value: "*" };
    this.boundedSourceID = "";
    this.termValue = undefined;
    this.setColour(getColorByType(this.termType));

    this.isCompleteBlock();
    if (this.isComplete) {
      // do type inference and type checker
      if (!searchABlockToBind(this)) {
        this.termTypeHasNoError = false;
        this.errorText += "- ID is not found.\n";
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
    if (this.workspace.id != mnlWorkspaceId) {
      if (!searchABlockToBind(this)) {
        let boundedBlock = evalWorkspace.getBlockById(this.boundedSourceID);
        if (boundedBlock) {
          this.termType = Object.assign({}, boundedBlock.termType);
          const newTermValue = JSON.stringify({ 'termValue': boundedBlock.termValue });
          this.termValue = JSON.parse(newTermValue).termValue;
        } else {
          let boundedBlock_ = mnlWorkspace.getBlockById(this.boundedSourceID);
          if (boundedBlock_) {
            this.termType = Object.assign({}, boundedBlock_.termType);
            const newTermValue = JSON.stringify({ 'termValue': boundedBlock_.termValue });
            this.termValue = JSON.parse(newTermValue).termValue;
          }
        }
      }
    }
  },

  evaluatorVisualization: function () {
    if (this.workspace.id != mnlWorkspaceId) {
      if (!searchABlockToBind(this)) {
        let boundedBlock = evalVisualizationWorkspace.getBlockById(this.boundedSourceID);
        if (boundedBlock) {
          this.termType = Object.assign({}, boundedBlock.termType);
          const newTermValue = JSON.stringify({ 'termValue': boundedBlock.termValue });
          this.termValue = JSON.parse(newTermValue).termValue;
        } else {
          let boundedBlock_ = mnlWorkspace.getBlockById(this.boundedSourceID);
          if (boundedBlock_) {
            this.termType = Object.assign({}, boundedBlock_.termType);
            const newTermValue = JSON.stringify({ 'termValue': boundedBlock_.termValue });
            this.termValue = JSON.parse(newTermValue).termValue;
          }
        }
      }
    }
  },

  evaluatorVisualizationCBV: function () {
    if (this.workspace.id != mnlWorkspaceId) {
      if (!searchABlockToBind(this)) {
        let boundedBlock = evalVisualizationWorkspaceCBV.getBlockById(this.boundedSourceID);
        if (boundedBlock) {
          this.termType = Object.assign({}, boundedBlock.termType);
          const newTermValue = JSON.stringify({ 'termValue': boundedBlock.termValue });
          this.termValue = JSON.parse(newTermValue).termValue;
        } else {
          let boundedBlock_ = mnlWorkspace.getBlockById(this.boundedSourceID);
          if (boundedBlock_) {
            this.termType = Object.assign({}, boundedBlock_.termType);
            const newTermValue = JSON.stringify({ 'termValue': boundedBlock_.termValue });
            this.termValue = JSON.parse(newTermValue).termValue;
          }
        }
      }
    }
  },

  saveExtraState: function () {
    return {
      boundedSourceID_: this.boundedSourceID,
    };
  },

  loadExtraState: function (state) {
    this.boundedSourceID = state["boundedSourceID_"];
  },

  isCompleteBlock: function () {
    let uidBlock = this.getInputTargetBlock("uidBlock");

    if (!uidBlock) {
      this.isComplete &&= false;
      this.errorText += "- Require an ID block.\n";
    } else {
      if (!uidBlock.isComplete) {
        this.isComplete &&= false;
        this.errorText += "- The ID block is incomplete.\n";
      }
    }
  },
};
