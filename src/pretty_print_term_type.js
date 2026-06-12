/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview
 * arrows in utf-16 ⮕ ⇨ ⇒ ￫ ⟹ ⇾ ➾ 🠢 🠒 🢂 🡆 🢚 ⟶ ⇛ ↣
 */

export function prettyPrintTermType(expType) {
  if (expType.key != undefined) {
    switch (expType.key) {
      case "nothing":
        return "nothing";
      case "*":
        //poly type
        if (expType.value == "*") {
          return "any"
        } else {
          return expType.value;
        }
      case "primitive":
        return expType.value;
      case "function":
        return (
          "function from (" +
          prettyPrintTermType(expType.value.from) +
          ") to (" +
          prettyPrintTermType(expType.value.to) + ")"
        );
      case "list":
        return "list of " + prettyPrintTermType(expType.value);
      case "tuple": {
        if (Object.keys(expType.value).length !== 0) {
          let item = "";
          if (expType.value["key"]) {
            if (expType.value["key"] == "*") {
              return "tuple of (*)";
            }
          }
          for (let itemName in expType.value) {
            if (itemName == "1") {
              item += prettyPrintTermType(expType.value[itemName]);
            } else {
              item += " and " + prettyPrintTermType(expType.value[itemName]);
            }
          }
          return "tuple of (" + item + ")";
        } else {
          return "empty tuple";
        }
      }
      case "record": {
        if (Object.keys(expType.value).length !== 0) {
          if (expType.value["key"]) {
            if (expType.value["key"] == "*") {
              return "record of {*}";
            }
          }
          let item = "";
          let i = 1;
          for (let itemName in expType.value) {
            if (i == 1) {
              item +=
                itemName + " : " + prettyPrintTermType(expType.value[itemName]);
            } else {
              item +=
                " and " +
                itemName +
                " : " +
                prettyPrintTermType(expType.value[itemName]);
            }
            i++;
          }
          return "record of {" + item + "}";
        }
      }
      case "field": {
        return (
          "field " + expType.value.fName +
          " with type " +
          prettyPrintTermType(expType.value.fValue)
        );
      }
      case "match": {
        return (
          prettyPrintTermType(expType.value.pat) +
          " ↣ " +
          prettyPrintTermType(expType.value.exp)
        );
      }
      default:
        break;
    }
  }
  return "Error!";
}
