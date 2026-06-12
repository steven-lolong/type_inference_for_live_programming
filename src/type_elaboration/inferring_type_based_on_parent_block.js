/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Infer type from parent block
 */

import { isLeftInputTermTypeEqual } from "../is_left_input_term_equal";
import { getName } from "../get_function_name";
import { constructTypeVariable } from "./construct_type_variable";

export function inferringTheTypeBasedOnTheParentBlock(
  funcBlock,
  childBlock,
  varName,
  typeEnv,
  typeVarCounter
) {
  let parentBlock = childBlock.getParent();
  let newType = "unknown";
  if (parentBlock) {
    if (parentBlock.termType !== undefined) {
      switch (parentBlock.type) {
        /** Start - constants */
        case "BlockConstBoolean": {
          newType = parentBlock.termType;
          break;
        }
        case "BlockConstCharacter": {
          newType = parentBlock.termType;
          break;
        }
        case "BlockConstNumber": {
          newType = parentBlock.termType;
          break;
        }
        case "BlockConstString": {
          newType = parentBlock.termType;
          break;
        }
        case "BlockConstUnit": {
          newType = parentBlock.termType;
          break;
        }
        /** End - constants */
        /** Start - primitive operator */
        case "BlockOperatorArithmeticCompare": {
          newType = parentBlock.expectedLhs;
          break;
        }
        case "BlockOperatorArithmetic": {
          newType = parentBlock.expectedLhs;
          break;
        }
        case "BlockOperatorBooleanCompare": {
          newType = parentBlock.expectedLhs;
          break;
        }
        case "BlockOperatorBooleanNot": {
          newType = parentBlock.expectedBlock;
          break;
        }
        case "BlockOperatorASCIIToCharacter": {
          newType = parentBlock.expectedBlock;
          break;
        }
        case "BlockOperatorCharacterToASCII": {
          newType = parentBlock.expectedBlock;
          break;
        }
        case "BlockOperatorListHead": {
          let tempTypeConstructorValue = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          if (childBlock.type == "BlockExpListConstructor") {
            newType = tempTypeConstructorValue;
          } else {
            newType = { key: "list", value: tempTypeConstructorValue };
          }
          break;
        }
        case "BlockOperatorListAppend": {
          let temp_newType = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          let lhsBlock = parentBlock.getInputTargetBlock("lhs");
          let rhsBlock = parentBlock.getInputTargetBlock("rhs");
          if (lhsBlock && rhsBlock) {
            if (temp_newType.key == "list") {
              if (childBlock.id == lhsBlock.id) {
                newType = temp_newType.value;
              }
              if (childBlock.id == rhsBlock.id) {
                newType = temp_newType;
              }
            } else {
              if (childBlock.id == lhsBlock.id) {
                if (rhsBlock.termType.key == "list" && rhsBlock.termType.value.value != "*") {
                  newType = rhsBlock.termType.value;
                } else {
                  let tempNewType = { key: "*", value: constructTypeVariable(typeVarCounter) };
                  if (typeVarCounter.a >= 0) {
                    typeVarCounter.a++;
                  }
                  newType = tempNewType;
                }
              }
              if (childBlock.id == rhsBlock.id) {
                if (lhsBlock.termType.value != "*") {
                  newType = {
                    key: "list",
                    value: lhsBlock.termType
                  }
                } else {
                  let tempNewType = { key: "*", value: constructTypeVariable(typeVarCounter) };
                  if (typeVarCounter.a >= 0) {
                    typeVarCounter.a++;
                  }
                  newType = {
                    key: "list",
                    value: tempNewType
                  };
                }

              }
            }
          }
          break;
        }
        case "BlockOperatorListIsEmpty": {
          let tempType = {
            key: "*",
            value: constructTypeVariable(typeVarCounter),
          };
          if (typeVarCounter.a >= 0) {
            typeVarCounter.a++;
          }
          newType = { key: "list", value: tempType };
          break;
        }
        case "BlockOperatorListTail": {
          let tempTypeConstructorValue = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          if (tempTypeConstructorValue.key == "list") {
            newType = tempTypeConstructorValue;
          } else {
            newType = {
              key: "list",
              value: tempTypeConstructorValue,
            };
          }
          break;
        }
        case "BlockOperatorStringConcatenate": {
          newType = parentBlock.expectedLhs;
          break;
        }
        case "BlockOperatorTupleGetItem": {
          let itemN = parentBlock.getFieldValue("itemN");
          if (childBlock.type == "BlockExpTupleConstructor") {
            newType = inferringTheTypeBasedOnTheParentBlock(
              funcBlock,
              parentBlock,
              varName,
              typeEnv,
              typeVarCounter
            );
          } else {
            newType = { key: "tuple", value: {} };
            for (let i = 1; i <= itemN; i++) {
              if (i == itemN) {
                newType.value[i] = inferringTheTypeBasedOnTheParentBlock(
                  funcBlock,
                  parentBlock,
                  varName,
                  typeEnv,
                  typeVarCounter
                );
              } else {
                let newTypeVariable = {
                  key: "*",
                  value: constructTypeVariable(typeVarCounter),
                };
                newType.value[i] = newTypeVariable;
                if (typeVarCounter.a >= 0) {
                  typeVarCounter.a++;
                }
              }
            }
          }

          break;
        }
        case "BlockOperatorRecordGetField": {
          let fieldN = parentBlock.getFieldValue("fieldN");

          let tempTypeConstructorValue = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          if (childBlock.type == "BlockExpRecordConstructor") {
            newType = tempTypeConstructorValue;
          } else {
            newType = { key: "record", value: {} };
            newType.value[fieldN] = tempTypeConstructorValue;
          }
          break;
        }
        /** End - primitive operator */
        /** Start - declaration blocks */
        case "BlockDecVariable": {
          break;
        }
        case "BlockDecFunction": {
          newType = parentBlock.termType.value.to;
          break;
        }
        /** End - declaration blocks */
        /** Start - expression blocks */
        case "BlockExpApplication": {
          let appBlock = parentBlock.getInputTargetBlock("exp1");
          let overBlock = parentBlock.getInputTargetBlock("exp2");
          if (appBlock) {
            if (appBlock.id == childBlock.id) {
              if (overBlock) {
                let paramType = overBlock.termType;
                if (overBlock.type == "BlockExpBound") {
                  let boundName = getName(overBlock, 4);
                  if (typeEnv[boundName]) {
                    paramType = typeEnv[boundName];
                  }
                }
                let toType = inferringTheTypeBasedOnTheParentBlock(
                  funcBlock,
                  parentBlock,
                  varName,
                  typeEnv,
                  typeVarCounter
                );
                newType = {
                  key: "function",
                  value: { from: paramType, to: toType },
                };
              }
            } else if (overBlock) {
              if (overBlock.id == childBlock.id) {
                if (appBlock.termType.key == "function") {
                  newType = appBlock.termType.value.from;
                } else {
                  newType = {
                    key: "*",
                    value: constructTypeVariable(typeVarCounter),
                  };
                  if (typeVarCounter.a >= 0) {
                    typeVarCounter.a++;
                  }
                }
              }
            }
          }
          break;
        }
        case "BlockExpBound": {
          break;
        }
        case "BlockExpIfElse": {
          let conditionBlock = parentBlock.getInputTargetBlock("condition");
          let thenBlock = parentBlock.getInputTargetBlock("then");
          let elseBlock = parentBlock.getInputTargetBlock("else");
          let tempNewType = {};

          if (conditionBlock && conditionBlock.id == childBlock.id) {
            newType = { key: "primitive", value: "boolean" };
          }

          if (thenBlock || elseBlock) {
            tempNewType = inferringTheTypeBasedOnTheParentBlock(
              funcBlock,
              parentBlock,
              varName,
              typeEnv,
              typeVarCounter
            );
          }
          if (thenBlock && thenBlock.id == childBlock.id) {
            if (elseBlock) {
              if (elseBlock.termType.key == "*") {
                if (tempNewType.key != "*") {
                  newType = tempNewType;
                }
                else {
                  newType = elseBlock.termType;
                }
              } else {
                newType = elseBlock.termType;
              }
            } else {
              // empty elseBlock
              newType = tempNewType;
            }
          }

          if (elseBlock && elseBlock.id == childBlock.id) {
            if (thenBlock) {
              if (thenBlock.termType.key == "*") {
                if (tempNewType.key != "*") {
                  newType = tempNewType;
                } else {
                  newType = thenBlock.termType;
                }
              } else {
                newType = thenBlock.termType;
              }
            } else {
              // empty thenBlock 
              newType = tempNewType;
            }
          }

          break;
        }
        case "BlockExpLambda": {
          newType = parentBlock.termType.value.to;
          break;
        }
        case "BlockExpLetIn": {
          let lastBlock = parentBlock.getInputTargetBlock(
            "ADD" + (parentBlock.itemCount_ - 1)
          );
          if (lastBlock && lastBlock.id == childBlock.id) {
            newType = inferringTheTypeBasedOnTheParentBlock(
              funcBlock,
              parentBlock,
              varName,
              typeEnv,
              typeVarCounter
            );
          } else {
            newType = { key: "*", value: constructTypeVariable(typeVarCounter) };
            if (typeVarCounter.a >= 0) {
              typeVarCounter.a++;
            }
          }

          break;
        }
        case "BlockExpListConstructor": {
          if (
            !isLeftInputTermTypeEqual(
              { key: "list", value: { key: "*", value: "*" } },
              parentBlock.termType.value
            )
          ) {
            if (
              parentBlock.termType.value.key == "*" &&
              parentBlock.termType.value.value == "*"
            ) {
              let temp_newType = inferringTheTypeBasedOnTheParentBlock(
                funcBlock,
                parentBlock,
                varName,
                typeEnv,
                typeVarCounter
              );
              if (temp_newType.key == "*" && temp_newType.value == "*") {
                newType = {
                  key: "*",
                  value: constructTypeVariable(typeVarCounter),
                };
                if (typeVarCounter.a >= 0) {
                  typeVarCounter.a++;
                }
              } else if (temp_newType.key == "list") {
                newType = temp_newType.value;
              } else {
                newType = temp_newType;
              }
            } else {
              newType = parentBlock.termType.value;
            }
          }
          if (parentBlock.itemCount_ == 0) {
            newType = {
              key: "*",
              value: constructTypeVariable(typeVarCounter),
            };
            if (typeVarCounter.a >= 0) {
              typeVarCounter.a++;
            }
          }
          break;
        }
        case "BlockExpSequence": {
          let lastBlock = parentBlock.getInputTargetBlock(
            "ADD" + (parentBlock.itemCount_ - 1)
          );
          if (lastBlock && lastBlock.id == childBlock.id) {
            newType = inferringTheTypeBasedOnTheParentBlock(
              funcBlock,
              parentBlock,
              varName,
              typeEnv,
              typeVarCounter
            );
          } else {
            newType = { key: "*", value: constructTypeVariable(typeVarCounter) };
            typeVarCounter.a++;
          }
          break;
        }
        case "BlockExpTupleConstructor": {
          let temp_newType = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          newType = { key: "*", value: constructTypeVariable(typeVarCounter) };
          if (typeVarCounter.a >= 0) {
            typeVarCounter.a++;
          }
          if (temp_newType.key == "tuple") {
            for (let i = 0; i < parentBlock.itemCount_; i++) {
              let catch_child_block = parentBlock.getInputTargetBlock("ADD" + i);
              if (catch_child_block && (catch_child_block.id == childBlock.id)) {
                if (temp_newType.value[i + 1]) {
                  newType = temp_newType.value[i + 1];
                  typeEnv[newType.value] = temp_newType.value[i + 1];
                }
              }
            }
          }
          if (temp_newType.key == "*" && temp_newType.value != "*") {
            if (typeEnv[temp_newType.value]) {
              if (typeEnv[temp_newType.value].key == "tuple") {
                for (let i = 0; i < parentBlock.itemCount_; i++) {
                  let catch_child_block = parentBlock.getInputTargetBlock("ADD" + i);
                  if (catch_child_block && (catch_child_block.id == childBlock.id)) {
                    if (typeEnv[temp_newType.value].value[i + 1]) {
                      newType = typeEnv[temp_newType.value].value[i + 1];
                    }
                  }
                }
              }
            }
          }

          break;
        }
        case "BlockExpRecordConstructor": {
          let temp_newType = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );

          newType = { key: "*", value: constructTypeVariable(typeVarCounter) };
          if (typeVarCounter.a >= 0) {
            typeVarCounter.a++;
          }

          if (temp_newType.key == "record") {
            for (let i = 0; i < parentBlock.itemCount_; i++) {
              let catch_child_block = parentBlock.getInputTargetBlock("ADD" + i);
              if (catch_child_block && (catch_child_block.id == childBlock.id)) {
                let rs_name = getName(childBlock, 5);
                if (temp_newType.value[rs_name]) {
                  newType = temp_newType.value[rs_name];
                  typeEnv[newType.value] = temp_newType.value[rs_name];
                }
              }
            }
          }
          if (temp_newType.key == "*" && temp_newType.value != "*") {
            if (typeEnv[temp_newType.value]) {
              if (typeEnv[temp_newType.value].key == "record") {
                for (let i = 0; i < parentBlock.itemCount_; i++) {
                  let catch_child_block = parentBlock.getInputTargetBlock("ADD" + i);
                  if (catch_child_block && (catch_child_block.id == childBlock.id)) {
                    let rs_name = getName(childBlock, 5);
                    if (typeEnv[temp_newType.value].value[rs_name]) {
                      newType = typeEnv[temp_newType.value].value[rs_name];
                    }
                  }
                }
              }
            }
          }
          break;
        }
        case "BlockField": {
          newType = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          break;
        }
        case "BlockExpCaseOf": {
          let switchBlock = parentBlock.getInputTargetBlock("switch");

          if (switchBlock && switchBlock.id == childBlock.id) {
            // try to infer type from case-pattern
            if (parentBlock.itemCount_ > 0) {
              for (let i = 0; i < parentBlock.itemCount_; i++) {
                let mtcBlock = parentBlock.getInputTargetBlock("ADD" + i);
                if (mtcBlock && (mtcBlock.termType != undefined)) {
                  if (mtcBlock.termType.value.pat.key != "*" && mtcBlock.termType.value.pat.value != "*") {
                    newType = mtcBlock.termType.value.pat;
                    break;
                  }
                }
              }
            }
          } else {
            let realType = null;
            let varType = null;
            for (let i = 0; i < parentBlock.itemCount_; i++) {
              let fieldBlock = parentBlock.getInputTargetBlock("ADD" + i);
              if (fieldBlock.id != childBlock.id) {
                if (fieldBlock.termType != undefined) {
                  if (fieldBlock.termType.value.exp.key != "*") {
                    realType = fieldBlock.termType.value.exp;
                    break;
                  } else {
                    varType = fieldBlock.termType.value.exp;
                  }
                }
              }
            }
            if (realType != null) {
              newType = realType;
            } else {
              if (parentBlock.termType != undefined) {
                if (parentBlock.termType.value != "*") {
                  newType = parentBlock.termType;
                } else {
                  newType = inferringTheTypeBasedOnTheParentBlock(
                    funcBlock,
                    parentBlock,
                    varName,
                    typeEnv,
                    typeVarCounter
                  );
                }
              }
            }

          }

          break;
        }
        case "BlockPatternMatch": {
          newType = inferringTheTypeBasedOnTheParentBlock(
            funcBlock,
            parentBlock,
            varName,
            typeEnv,
            typeVarCounter
          );
          break;
        }
        default: {
        }
      }
    }
  }

  if (isHasTypeAny(newType)) {
    newType = constructTypeVariableForTypeAny(newType, typeVarCounter);
  }

  return newType;
}

// isHasTypeAny, this mostly occur on empty list
function isHasTypeAny(tt) {
  let termType_ = Object.assign({}, tt);
  switch (termType_.key) {
    case "*": {
      if (termType_.value == "*") {
        return true;
      }
      return false;
    }
    case "primitve": {
      return false;

    } case "list": {
      if (termType_.value.key == "*") {
        if (termType_.value.value == "*") {
          return true;
        }
        return false;
      } else {
        return isHasTypeAny(termType_.value);
      }
    }
    case "tuple":
      {
        if (Object.keys(termType_.value).length !== 0) {
          let hasAny = false;
          if (termType_.value["key"]) {
            if (termType_.value["key"] == "*") {
              return false;
            }
          }
          for (let itemName in termType_.value) {
            hasAny ||= isHasTypeAny(termType_.value[itemName]);
          }
          return hasAny;
        } else {
          return false;
        }
      }
    case "record":
      {
        if (Object.keys(termType_.value).length !== 0) {
          if (termType_.value["key"]) {
            if (termType_.value["key"] == "*") {
              return false;
            }
          }
          let hasAny = false;
          for (let itemName in termType_.value) {
            hasAny ||= isHasTypeAny(termType_.value[itemName]);
          }
          return hasAny;
        }
      }
    case "field": {
      return isHasTypeAny(termType_.value.fValue);
    }
    case "match": {
      return isHasTypeAny(termType_.value.exp);
    } default:
      return false;
  }
}

function constructTypeVariableForTypeAny(tt, typeVarCounter) {
  if (tt.key) {
    switch (tt.key) {
      case "nothing":
        return tt;
      case "*":
        if (tt.value == "*") {
          if (typeVarCounter.a < 0) {
            return { key: "*", value: "*" };
          }
          typeVarCounter.a++;
          return { key: "*", value: constructTypeVariable(typeVarCounter) }
        }
        return tt;
      case "primitive":
        return tt;
      case "function":
        return {
          key: tt.key,
          value: {
            from: constructTypeVariableForTypeAny(tt.value.from, typeVarCounter),
            to: constructTypeVariableForTypeAny(tt.value.to, typeVarCounter)
          }
        };
      case "list":
        if (tt.value.key == "*" && tt.value.value == "*") {
          if (typeVarCounter.a < 0) {
            return { key: tt.key, value: { key: "*", value: "*" } };
          }
          let newType = { key: "*", value: constructTypeVariable(typeVarCounter) }
          typeVarCounter.a++;
          return { key: tt.key, value: newType };
        } else {
          return { key: tt.key, value: constructTypeVariableForTypeAny(tt.value, typeVarCounter) };
        }
      case "tuple": {
        if (Object.keys(tt.value).length !== 0) {
          let newType = { key: tt.key, value: {} };
          for (let itemName in tt.value) {
            newType.value[itemName] = constructTypeVariableForTypeAny(tt.value[itemName], typeVarCounter);
          }
          return newType;
        } else {
          return tt;
        }
      }
      case "record": {
        if (Object.keys(tt.value).length !== 0) {
          let newType = { key: tt.key, value: {} };
          for (let itemName in tt.value) {
            newType.value[itemName] = constructTypeVariableForTypeAny(tt.value[itemName], typeVarCounter);
          }
          return newType;
        } else {
          return tt;
        }
      }
      case "field": {
        return {
          key: tt.key, value: { fName: tt.value.fName, fValue: constructTypeVariableForTypeAny(tt.value.fValue, typeVarCounter) }
        };
      }
      case "match": {
        return {
          key: tt.key,
          value: {
            pat: tt.value.pat,
            exp: constructTypeVariableForTypeAny(tt.value.exp, typeVarCounter)
          }
        };
      }
      default:
        break;
    }
  }
}