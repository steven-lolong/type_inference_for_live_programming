/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview input term type checker
 */

export function inputTermTypeChecker(expected, inputed) {
  if (expected.key == undefined || inputed.key == undefined) {
    return false;
  }
  // poly type
  if (expected.key == "*") {
    return true;
  }

  if (expected.key == inputed.key) {
    switch (expected.key) {
      case "primitive":
        return expected.value == inputed.value;
      case "function":
        return (
          inputTermTypeChecker(expected.value.from, inputed.value.from) &&
          inputTermTypeChecker(expected.value.to, inputed.value.to)
        );
      case "list":
        return inputTermTypeChecker(expected.value, inputed.value);
      case "tuple": {
        let expectedLength = Object.keys(expected.value).length;
        let inputedLength = Object.keys(inputed.value).length;
        if (expectedLength > 0) {
          if (expected.value["key"]) {
            if (expected.value["key"] == "*") {
              return true;
            }
          } else if (expectedLength <= inputedLength) {
            let equal = true;
            for (let i = 1; i <= expectedLength; i++) {
              if (expected.value[i] && inputed.value[i]) {
                equal &&= inputTermTypeChecker(
                  expected.value[i],
                  inputed.value[i]
                );
              } else {
                // tt2 inhabitants is less than tt2
                return false;
              }
            }
            return equal;
          }
        } else {
          // check whether both is an empty tuple
          return expectedLength == inputedLength;
        }
        break;
      }
      case "record": {
        let expectedLength = Object.keys(expected.value).length;
        let inputedLength = Object.keys(inputed.value).length;
        if (expectedLength > 0) {
          if (expected.value["key"]) {
            if (expected.value["key"] == "*") {
              return true;
            }
          } else if (expectedLength <= inputedLength) {
            let equal = true;
            for (let i in expected.value) {
              if (expected.value[i] && inputed.value[i]) {
                equal &&= inputTermTypeChecker(
                  expected.value[i],
                  inputed.value[i]
                );
              } else {
                // tt2 inhabitants is less than tt2
                return false;
              }
            }
            return equal;
          }
        } else {
          // check whether both is an empty record
          return expectedLength == inputedLength;
        }
        break;
      }
      default:
        console.log("unknown type of expected value: " + JSON.stringify(expected.key));
        return false;
    }
    return false;
  } else {
    return false;
  }
}
