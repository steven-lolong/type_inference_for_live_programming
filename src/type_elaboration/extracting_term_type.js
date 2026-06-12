/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Extracting term type
 */

/**
 * targetEnv = the environment hold all type variables mapping
 * orgTermType = the original structure of type variable
 * srcTermType = the source for extracting termType
 */

export function extractTermType(targetEnv, orgTermType, srcTermType) {
  switch (orgTermType.key) {
    case "*": {
      targetEnv[orgTermType.value] = srcTermType;
      break;
    }
    case "function": {
      if (srcTermType.key == "function") {
        extractTermType(
          targetEnv,
          orgTermType.value.from,
          srcTermType.value.from
        );
        extractTermType(targetEnv, orgTermType.value.to, srcTermType.value.to);
      }
      break;
    }
    case "list": {
      extractTermType(targetEnv, orgTermType.value, srcTermType.value);
      break;
    }
    case "tuple": {
      let orgTermTypeLength = Object.keys(orgTermType.value).length;
      let srcTermTypeLength = Object.keys(srcTermType.value).length;
      if (orgTermTypeLength > 0) {
        if (orgTermType.value["key"] && orgTermType.value["value"]) {
          if (
            orgTermType.value["key"] == "*" &&
            orgTermType.value["value"] != "*"
          ) {
            targetEnv[orgTermType.value["value"]] = srcTermType;
          }
        } else if (orgTermTypeLength == srcTermTypeLength) {
          for (let i = 1; i <= orgTermTypeLength; i++) {
            if (orgTermType.value[i] && srcTermType.value[i]) {
              extractTermType(
                targetEnv,
                orgTermType.value[i],
                srcTermType.value[i]
              );
            }
          }
        }
      }
      break;
    }
    case "record": {
      let orgTermTypeLength = Object.keys(orgTermType.value).length;
      let srcTermTypeLength = Object.keys(srcTermType.value).length;
      if (orgTermTypeLength > 0) {
        if (orgTermType.value["key"] && orgTermType.value["value"]) {
          if (
            orgTermType.value["key"] == "*" &&
            orgTermType.value["value"] != "*"
          ) {
            targetEnv[orgTermType.value["value"]] = srcTermType;
          }
        } else {
          for (let i in orgTermType.value) {
            if (orgTermType.value[i] && srcTermType.value[i]) {
              extractTermType(
                targetEnv,
                orgTermType.value[i],
                srcTermType.value[i]
              );
            }
          }
        }
      }
      break;
    }
    default: {
      break;
    }
  }
}
