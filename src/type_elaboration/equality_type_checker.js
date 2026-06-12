/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview input term type checker
 */

export function equalityTypeChecker(typ1, typ2) {
  if (typ1.key == typ2.key) {
    switch (typ1.key) {
      case "*": {
        if (typ1.value == "*" || typ2.value == "*") {
          return true;
        }
        return typ1.value == typ2.value;
      }
      case "primitive":
        return typ1.value == typ2.value;
      case "function":
        return (
          equalityTypeChecker(typ1.value.from, typ2.value.from) &&
          equalityTypeChecker(typ1.value.to, typ2.value.to)
        );
      case "list":
        return equalityTypeChecker(typ1.value, typ2.value);
      case "tuple": {
        let typ1Length = Object.keys(typ1.value).length;
        let typ2Length = Object.keys(typ2.value).length;
        if (typ1Length > 0) {
          if (typ1.value["key"]) {
            if (typ1.value["key"] == "*") {
              return true;
            }
          } else if (typ1Length == typ2Length) {
            let equal = true;
            for (let i = 1; i <= typ1Length; i++) {
              if (typ1.value[i] && typ2.value[i]) {
                equal &&= equalityTypeChecker(typ1.value[i], typ2.value[i]);
              } else {
                return false;
              }
            }
            return equal;
          }
        } else {
          // check whether both is an empty tuple
          return typ1Length == typ2Length;
        }
      }
      case "record": {
        let typ1Length = Object.keys(typ1.value).length;
        let typ2Length = Object.keys(typ2.value).length;
        if (typ1Length > 0) {
          if (typ1.value["key"]) {
            if (typ1.value["key"] == "*") {
              return true;
            }
          } else if (typ1Length == typ2Length) {
            let equal = true;
            for (let i in typ1.value) {
              if (typ1.value[i] && typ2.value[i]) {
                equal &&= equalityTypeChecker(typ1.value[i], typ2.value[i]);
              } else {
                // tt2 inhabitants is less than tt2
                return false;
              }
            }
            return equal;
          }
        } else {
          // check whether both is an empty record
          return typ1Length == typ2Length;
        }
      }
      case "match": {
        return (
          patternTypeChecker(typ1.value.pat, typ2.value.pat) &&
          equalityTypeChecker(typ1.value.exp, typ2.value.exp)
        );
      }
      default:
        console.log("unknown type of typ1 value");
        return false;
    }
  } else {
    return false;
  }
}

function patternTypeChecker(typ1, typ2) {
  // pattern matching for any
  if (
    (typ1.key == "*" && typ1.value == "*") ||
    (typ2.key == "*" && typ2.value == "*")
  ) {
    return true;
  }
  return equalityTypeChecker(typ1, typ2);
}
