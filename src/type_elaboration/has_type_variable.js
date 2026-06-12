/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview has_type_variable
 * check whether the type has type variable or not
 */

export function hasTypeVariable(blockTermType) {
  let hasTypeVar = false;
  switch (blockTermType.key) {
    case "*": {
      hasTypeVar ||= true;
      break;
    }
    case "function": {
      hasTypeVar ||= hasTypeVariable(blockTermType.value.from);
      hasTypeVar ||= hasTypeVariable(blockTermType.value.to);
      break;
    }
    case "list": {
      hasTypeVar ||= hasTypeVariable(blockTermType.value);
      break;
    }
    case "tuple": {
      for (let i in blockTermType.value) {
        hasTypeVar ||= hasTypeVariable(blockTermType.value[i]);
      }
      break;
    }
    case "record": {
      for (let i in blockTermType.value) {
        hasTypeVar ||= hasTypeVariable(blockTermType.value[i]);
      }
      break;
    }
    default:
      return hasTypeVar;
  }
  return hasTypeVar;
}
