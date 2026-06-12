/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Type constructor
 */

import { typeConstraintsBuilder } from "./type_constraints_builder";
import { unification } from "./unification";
import { getName, getFunctionName } from "../get_function_name";
import { isLeftInputTermTypeEqual } from "../is_left_input_term_equal";
import { updateExpBoundType } from "./update_exp_bound_type";
import { constructTypeVariable } from "./construct_type_variable";

export function typeConstructor(
  srcLambdaBlock,
  lambdaEnv,
  typeConstraintEnv,
  typeVarCounter
) {
  let srcLambdaBlockBody = srcLambdaBlock.getInputTargetBlock("inputExp");
  let srcLambdaBlockParameter =
    srcLambdaBlock.getInputTargetBlock("inputParam");

  // catch/ create the name
  let parameterName = getName(srcLambdaBlockParameter, 3);
  let functionName = getFunctionName(srcLambdaBlock);

  if (srcLambdaBlock.type == "BlockExpLambda") {
    srcLambdaBlock.tempLambdaName = functionName;
  }
  let newArrowType = {
    key: "function",
    value: { from: { key: "*", value: "*" }, to: { key: "*", value: "*" } },
  };

  // the final environment
  let newLambdaEnv;

  /******* Begin - type generalisation ******* */
  if (srcLambdaBlockParameter && srcLambdaBlockBody && functionName != "") {
    // generalise the variable type
    if (parameterName != "") {
      let paramName = {
        key: "*",
        value: constructTypeVariable(typeVarCounter),
      };
      lambdaEnv[parameterName] = paramName;
      typeConstraintEnv[parameterName] = paramName;

      typeVarCounter.a++;
    } else {
      // parameter is a unit
      parameterName = "unit";
      lambdaEnv[parameterName] = { key: "primitive", value: "unit" };
    }

    // update parameter type, this is a phase of type generalization first phase
    if (srcLambdaBlockParameter.isComplete) {
      srcLambdaBlockParameter.termType = lambdaEnv[parameterName];
      srcLambdaBlockParameter.updateDisplay();
    }

    // generalise the body type
    let returnType = {
      key: "*",
      value: constructTypeVariable(typeVarCounter),
    };
    typeVarCounter.a++;

    // generalise the function type
    newArrowType = {
      key: "function",
      value: { from: lambdaEnv[parameterName], to: returnType },
    };

    // bind newArrowType to function's name
    lambdaEnv[functionName] = newArrowType;
    typeConstraintEnv[functionName] = newArrowType;

    // bind generalisation of type to the block
    srcLambdaBlock.termType = newArrowType;

    // updating the type of expression bound
    updateExpBoundType(srcLambdaBlock);

    /******* End - type generalisation ******* */

    /******* Begin - environment construction ******* */
    let newTypeConstraintEnv = Object.assign(
      {},
      typeConstraintsBuilder(
        srcLambdaBlock,
        lambdaEnv,
        typeConstraintEnv,
        srcLambdaBlockBody,
        typeVarCounter
      )
    );

    /******* End  - environment construction ******* */

    /******* Begin - unification ******* */
    let tmpTypeConstraint = unification(
      newTypeConstraintEnv,
      newTypeConstraintEnv
    );

    let tmpLambdaEnv = Object.assign({}, lambdaEnv);
    tmpLambdaEnv = unification(lambdaEnv, lambdaEnv);

    newLambdaEnv = Object.assign({}, lambdaEnv);

    newLambdaEnv = unification(tmpTypeConstraint, tmpLambdaEnv);
    /** End - unification */

    /** Begin - update parameter color */
    if (srcLambdaBlockParameter.isComplete) {
      srcLambdaBlockParameter.termType = newLambdaEnv[parameterName];
      srcLambdaBlockParameter.updateDisplay();
    }

    /** End - update parameter color */

    // updating the type of expression bound
    updateExpBoundType(srcLambdaBlock);

    //  when the inference can't construct the return type then take it from the connected block on input expression
    if (
      isLeftInputTermTypeEqual(returnType, newLambdaEnv[functionName].value.to)
    ) {
      if (!isLeftInputTermTypeEqual(srcLambdaBlockBody.termType, returnType)) {
        newLambdaEnv[functionName].value.to = srcLambdaBlockBody.termType;
      }
    }

    /******* Begin - type instantiation */
    srcLambdaBlock.termType = newLambdaEnv[functionName];
    // updating the type of expression bound
    updateExpBoundType(srcLambdaBlock);

    /** End - type instantiation */
  }
  return newLambdaEnv;
}
