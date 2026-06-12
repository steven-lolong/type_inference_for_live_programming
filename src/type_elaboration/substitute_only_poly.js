/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Substitute only a variable with polymorphic type(s)
 */

export function substituteOnlyPoly(targetType, inputType) {
  let newType = Object.assign({}, targetType);
  let newInputType = Object.assign({}, inputType);
  switch (newType.key) {
    case "*": {
      if (newInputType.key != "*") {
        return {
          key: newInputType.key,
          value: newInputType.value,
        };
      }
      break;
    }
    case "function": {
      if (newInputType.key == "function") {
        return {
          key: "function",
          value: {
            from: substituteOnlyPoly(
              newType.value.from,
              newInputType.value.from
            ),
            to: substituteOnlyPoly(newType.value.from, newInputType.value.from),
          },
        };
      }
      break;
    }
    case "list": {
      if (newInputType.key == "list") {
        let x = {
          key: "list",
          value: substituteOnlyPoly(newType.value, newInputType.value),
        };
        return x;
      }
      break;
    }
    case "tuple": {
      if (newInputType.key == "tuple") {
        let newTypeLength = Object.keys(newType.value).length;
        if (newTypeLength > 0) {
          if (newType.value["key"]) {
            if (newType.value["key"] == "*") {
              return newInputType;
            }
          } else if (newTypeLength == Object.keys(newInputType.value).length) {
            for (let i in newType.value) {
              newType.value[i] = substituteOnlyPoly(
                newType.value[i],
                newInputType.value[i]
              );
            }
            return newType;
          }
        }
      }
    }
    case "record": {
      if (newInputType.key == "record") {
        let newTypeLength = Object.keys(newType.value).length;
        if (newTypeLength > 0) {
          if (newType.value["key"]) {
            if (newType.value["key"] == "*") {
              return newInputType;
            }
          } else {
            for (let i in newType.value) {
              newType.value[i] = substituteOnlyPoly(
                newType.value[i],
                newInputType.value[i]
              );
            }
            return newType;
          }
        }
      }
    }
    default:
      return newType;
  }
  return newType;
}
