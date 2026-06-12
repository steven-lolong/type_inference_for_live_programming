/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview equality term type checker
 */

export function hasAnyType(tt) {
  switch (tt.key) {
    case "*":
      if (tt.value == "*") {
        return true;
      }
      break;
    case "primitive":
      return false;
    case "function":
      return hasAnyType(tt.value.from) || (hasAnyType(tt.value.to));
    case "list":
      return hasAnyType(tt.value)
    case "tuple": {
      let ttLength = Object.keys(tt.value).length;
      if (ttLength > 0) {
        if (tt.value["key"]) {
          if (tt.value["key"] == "*") {
            return true;
          } else {
            let hasAny_ = false;
            for (let i = 1; i <= ttLength; i++) {
              hasAny_ ||= hasAnyType(tt.value[i]);
            }
            return hasAny_;
          }
        }
      }
      break;
    }
    case "record": {
      let ttLength = Object.keys(tt.value).length;
      if (ttLength > 0) {
        if (tt.value["key"]) {
          if (tt.value["key"] == "*") {
            return true;
          } else {
            let hasAny_ = false;
            for (let i in tt.value) {
              hasAny_ ||= hasAnyType(tt.value[i]);
            }
            return hasAny_;
          }
        }
      }
      break;
    }
    case "field": {
      break;
    }
    case "match": {
      break;
    }
    default:
      return false;
  }
  return false;
}

