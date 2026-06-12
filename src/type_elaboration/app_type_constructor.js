/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview appTypeConstructor
 * Type constructor for block of expression-application
 */

import { inputTermTypeChecker } from "./input_term_type_checker.js";

export function appBlockTypeConstructor(termType1, termType2) {
  if (inputTermTypeChecker(termType1.value.from, termType2)) {
    let env = [];
    buildEnvironment(
      env,
      Object.assign({}, termType1.value.from),
      Object.assign({}, termType2)
    );
    return substituteBasedOnEnvironment(env, termType1);
  }
  return {};
}

export function buildEnvironment(
  env,
  oriParameterTermType,
  newParameterTermType
) {
  switch (oriParameterTermType.key) {
    case "*": {
      if (!env[oriParameterTermType.value]) {
        env[oriParameterTermType.value] = {
          key: newParameterTermType.key,
          value: newParameterTermType.value,
        };
      }
      break;
    }
    case "function": {
      buildEnvironment(
        env,
        oriParameterTermType.value.from,
        newParameterTermType.value.from
      );
      buildEnvironment(
        env,
        oriParameterTermType.value.to,
        newParameterTermType.value.to
      );
      break;
    }
    case "list": {
      buildEnvironment(
        env,
        oriParameterTermType.value,
        newParameterTermType.value
      );
      break;
    }
    case "tuple": {
      for (let i in oriParameterTermType.value) {
        if (newParameterTermType.value[i]) {
          buildEnvironment(env, oriParameterTermType.value[i], newParameterTermType.value[i]);
        }
      }
      break;
    }
    case "record": {
      for (let i in oriParameterTermType.value) {
        if (newParameterTermType.value[i]) {
          buildEnvironment(env, oriParameterTermType.value[i], newParameterTermType.value[i]);
        }
      }
      break;
    }
    default: {
      break;
    }
  }
}

export function substituteBasedOnEnvironment(env, parameterTermType) {
  let newParameterTermType = Object.assign({}, parameterTermType);

  switch (newParameterTermType.key) {
    case "*": {
      if (env[newParameterTermType.value]) {
        return {
          key: env[newParameterTermType.value].key,
          value: env[newParameterTermType.value].value,
        };
      }
      break;
    }
    case "function": {
      return {
        key: "function",
        value: {
          from: substituteBasedOnEnvironment(
            env,
            newParameterTermType.value.from
          ),
          to: substituteBasedOnEnvironment(env, newParameterTermType.value.to),
        },
      };
    }
    case "list": {
      return {
        key: "list",
        value: substituteBasedOnEnvironment(env, newParameterTermType.value),
      };
    }
    case "tuple": {
      let newTerm = {
        key: "tuple",
        value: []
      }
      for (let i in newParameterTermType.value) {
        newTerm.value[i] = substituteBasedOnEnvironment(env, newParameterTermType.value[i]);
      }
      return newTerm;
    }
    case "record": {
      let newTerm = {
        key: "record",
        value: []
      }
      for (let i in newParameterTermType.value) {
        newTerm.value[i] = substituteBasedOnEnvironment(env, newParameterTermType.value[i]);
      }
      return newTerm;
    }
    default: {
      return newParameterTermType;
    }
  }
  return newParameterTermType;
}
