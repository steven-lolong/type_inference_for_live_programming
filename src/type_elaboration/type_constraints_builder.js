/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview type constraints builder
 * Building the environment of type inference
 */

import { typeConstructor } from "./type_constructor";
import { getName } from "../get_function_name";
import { inferringTheTypeBasedOnTheParentBlock } from "./inferring_type_based_on_parent_block";
import { hasTypeVariable } from "./has_type_variable";
import { extractAndUpdateTermType } from "./update_and_extract_type_in_env";

export function typeConstraintsBuilder(
  srcFuncBlock, // the function that calls type constructor
  funcEnv, // passing by reference
  typeConstraintEnv, // passing by reference
  inferBlock, // expression block which connected to expression input of the function
  typeVarCounter
) {
  /******* Begin - function ******* */
  let newType;
  let inferBlockType = inferBlock.type;

  /** forcing to quit when the environment is not valid because of visual gesture */
  if (typeConstraintEnv == undefined) return [];
  /** end forcing */

  if (inferBlockType == "BlockDecFunction") {
    typeConstructor(inferBlock, {}, typeConstraintEnv, typeVarCounter);
  }
  if (inferBlockType == "BlockDecVariable") {
    let varInputExpBlock = inferBlock.getInputTargetBlock("inputExp");
    if (varInputExpBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        varInputExpBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockExpApplication") {
    let exp1Block = inferBlock.getInputTargetBlock("exp1");
    let exp2Block = inferBlock.getInputTargetBlock("exp2");
    if (exp1Block) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        exp1Block,
        typeVarCounter
      );
    }
    if (exp2Block) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        exp2Block,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockExpBound") {
    let expBoundId = getName(inferBlock, 4);
    // check whether the variable is in the function scope and the termType has type variable which means need to infer the type
    if (
      typeConstraintEnv[expBoundId] &&
      hasTypeVariable(typeConstraintEnv[expBoundId])
    ) {
      newType = inferringTheTypeBasedOnTheParentBlock(
        srcFuncBlock,
        inferBlock,
        expBoundId,
        typeConstraintEnv,
        typeVarCounter
      );
      switch (inferBlock.termType.key) {
        case "*": {
          let blockTypeVariableValue = inferBlock.termType.value; //type variable
          // the type variable is not in the environment 
          if (newType != "unknown") {
            if (!typeConstraintEnv[blockTypeVariableValue]) {
              typeConstraintEnv[blockTypeVariableValue] = newType;

            } else {
              // the type variable was in the environment (already)
              typeConstraintEnv[blockTypeVariableValue] = extractAndUpdateTermType(
                typeConstraintEnv, Object.assign({}, typeConstraintEnv[blockTypeVariableValue]),
                newType
              );
            }
          }
          break;
        }
        case "function": {
          if (newType.key == "function") {
            typeConstraintEnv[expBoundId] = extractAndUpdateTermType(typeConstraintEnv, Object.assign({}, typeConstraintEnv[expBoundId], newType));
          }
          break;
        }
        default:
          break;
      }
    }
  }
  if (inferBlockType == "BlockExpIfElse") {
    let conditionBlock = inferBlock.getInputTargetBlock("condition");
    let thenBlock = inferBlock.getInputTargetBlock("then");
    let elseBlock = inferBlock.getInputTargetBlock("else");

    if (conditionBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        conditionBlock,
        typeVarCounter
      );
    }

    if (thenBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        thenBlock,
        typeVarCounter
      );
    }

    if (elseBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        elseBlock,
        typeVarCounter
      );
    }
  }
  // Lambda expression
  if (inferBlockType == "BlockExpLambda") {
    typeConstructor(inferBlock, typeConstraintEnv, typeConstraintEnv, typeVarCounter);
  }
  if (inferBlockType == "BlockExpLetIn") {
    let decBlock = inferBlock.getInputTargetBlock("declaration");
    // infer from all block in the let declaration statement
    while (decBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        decBlock,
        typeVarCounter
      );
      decBlock = decBlock.getNextBlock();
    }
    // infer from all block in the in body
    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        // input has attached by expression block
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // List constructor
  if (inferBlockType == "BlockExpListConstructor") {
    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // case match
  if (inferBlockType == "BlockExpCaseOf") {
    let switchBlock = inferBlock.getInputTargetBlock("switch");

    if (switchBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        switchBlock,
        typeVarCounter
      );
    }

    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // mtc
  if (inferBlockType == "BlockPatternMatch") {
    let expBlock = inferBlock.getInputTargetBlock("exp");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  // Sequence
  if (inferBlockType == "BlockExpSequence") {
    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // Tuple constructor
  if (inferBlockType == "BlockExpTupleConstructor") {
    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // Record constructor
  if (inferBlockType == "BlockExpRecordConstructor") {
    for (let i = 0; i < inferBlock.itemCount_; i++) {
      if (inferBlock.getInputTargetBlock("ADD" + i)) {
        typeConstraintsBuilder(
          srcFuncBlock,
          funcEnv,
          typeConstraintEnv,
          inferBlock.getInputTargetBlock("ADD" + i),
          typeVarCounter
        );
      }
    }
  }
  // Arithmetic operator
  if (inferBlockType == "BlockOperatorArithmeticCompare") {
    let lhsBlock = inferBlock.getInputTargetBlock("lhs");
    let rhsBlock = inferBlock.getInputTargetBlock("rhs");
    if (rhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        rhsBlock,
        typeVarCounter
      );
    }

    if (lhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        lhsBlock,
        typeVarCounter
      );
    }

  }
  if (inferBlockType == "BlockOperatorArithmetic") {
    let lhsBlock = inferBlock.getInputTargetBlock("lhs");
    let rhsBlock = inferBlock.getInputTargetBlock("rhs");

    if (lhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        lhsBlock,
        typeVarCounter
      );
    }
    if (rhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        rhsBlock,
        typeVarCounter
      );
    }
  }
  // Boolean operator
  if (inferBlockType == "BlockOperatorBooleanCompare") {
    let lhsBlock = inferBlock.getInputTargetBlock("lhs");
    let rhsBlock = inferBlock.getInputTargetBlock("rhs");

    if (lhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        lhsBlock,
        typeVarCounter
      );
    }
    if (rhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        rhsBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockOperatorBooleanNot") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  // Character operator
  if (inferBlockType == "BlockOperatorASCIIToCharacter") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockOperatorCharacterToASCII") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  // List operator
  if (inferBlockType == "BlockOperatorListAppend") {
    let lhsBlock = inferBlock.getInputTargetBlock("lhs");
    let rhsBlock = inferBlock.getInputTargetBlock("rhs");

    if (lhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        lhsBlock,
        typeVarCounter
      );
    }
    if (rhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        rhsBlock,
        typeVarCounter
      );
    }
  }

  if (inferBlockType == "BlockOperatorListHead") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockOperatorListIsEmpty") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockOperatorListTail") {
    let expBlock = inferBlock.getInputTargetBlock("expBlock");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  // String operator
  if (inferBlockType == "BlockOperatorStringConcatenate") {
    let lhsBlock = inferBlock.getInputTargetBlock("lhs");
    let rhsBlock = inferBlock.getInputTargetBlock("rhs");

    if (lhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        lhsBlock,
        typeVarCounter
      );
    }
    if (rhsBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        rhsBlock,
        typeVarCounter
      );
    }
  }
  // Tuple operator
  if (inferBlockType == "BlockOperatorTupleGetItem") {
    let expBlock = inferBlock.getInputTargetBlock("mainInput");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  // Record operator
  if (inferBlockType == "BlockOperatorRecordGetField") {
    let expBlock = inferBlock.getInputTargetBlock("mainInput");

    if (expBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        expBlock,
        typeVarCounter
      );
    }
  }
  if (inferBlockType == "BlockField") {
    let inputExpBlock = inferBlock.getInputTargetBlock("inputExp");
    if (inputExpBlock) {
      typeConstraintsBuilder(
        srcFuncBlock,
        funcEnv,
        typeConstraintEnv,
        inputExpBlock,
        typeVarCounter
      );
    }
  }

  return typeConstraintEnv;
  /******* End - function ******* */
}
