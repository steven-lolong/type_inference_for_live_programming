/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Unification - subtitute all type variable with a type
 */

export function unification(srcTypeEnv_, targetTypeEnv_) {
  let srcTypeEnv = Object.assign({}, srcTypeEnv_);
  let targetTypeEnv = Object.assign({}, targetTypeEnv_);

  if (targetTypeEnv.key) {
    if (targetTypeEnv.key == "*") {
      if (targetTypeEnv.value !== Object(targetTypeEnv.value)) {
        // the value of poly type is always a non-object [A..Z]+
        Object.keys(srcTypeEnv).forEach((srcKey) => {
          if (targetTypeEnv.value == srcKey) {
            targetTypeEnv = srcTypeEnv[srcKey];
          }
        });
      }
    }
  } else {
    Object.keys(targetTypeEnv).forEach((targetKey) => {
      Object.keys(srcTypeEnv).forEach((srcKey) => {
        if (targetTypeEnv[targetKey] != undefined) {
          switch (targetTypeEnv[targetKey].key) {
            case "*": {
              // polymorphic type
              if (
                targetTypeEnv[targetKey].value !==
                Object(targetTypeEnv[targetKey].value)
              ) {
                // the value of poly type is always a non-object
                if (targetTypeEnv[targetKey].value == srcKey) {
                  targetTypeEnv[targetKey] = srcTypeEnv[srcKey];
                }
                return unification(srcTypeEnv, targetTypeEnv[targetKey].value);
              }
              break;
            }
            case "list": {
              if (
                targetTypeEnv[targetKey].value ===
                Object(targetTypeEnv[targetKey].value)
              ) {
                targetTypeEnv[targetKey].value = unification(
                  srcTypeEnv,
                  targetTypeEnv[targetKey].value
                );
              } else if (
                targetTypeEnv[targetKey].key == "*" &&
                targetTypeEnv[targetKey].value == srcKey
              ) {
                targetTypeEnv[targetKey] = srcTypeEnv[srcKey];
              }

              break;
            }
            case "tuple": {
              if (
                targetTypeEnv[targetKey].value ===
                Object(targetTypeEnv[targetKey].value)
              ) {
                for (let i in targetTypeEnv[targetKey].value) {
                  if (
                    targetTypeEnv[targetKey].value[i] ===
                    Object(targetTypeEnv[targetKey].value[i])
                  ) {
                    targetTypeEnv[targetKey].value[i] = unification(
                      srcTypeEnv,
                      targetTypeEnv[targetKey].value[i]
                    );
                  }
                }
              }
              break;
            }
            case "record": {
              if (
                targetTypeEnv[targetKey].value ===
                Object(targetTypeEnv[targetKey].value)
              ) {
                for (let i in targetTypeEnv[targetKey].value) {
                  if (
                    targetTypeEnv[targetKey].value[i] ===
                    Object(targetTypeEnv[targetKey].value[i])
                  ) {
                    targetTypeEnv[targetKey].value[i] = unification(
                      srcTypeEnv,
                      targetTypeEnv[targetKey].value[i]
                    );
                  }
                }
              }
              break;
            }
            case "function": {
              // from checking
              if (
                targetTypeEnv[targetKey].value.from ===
                Object(targetTypeEnv[targetKey].value.from)
              ) {
                targetTypeEnv[targetKey].value.from = unification(
                  srcTypeEnv,
                  targetTypeEnv[targetKey].value.from
                );
              } else {
                if (
                  targetTypeEnv[targetKey].value.from.key == "*" &&
                  targetTypeEnv[targetKey].value.from.value == srcKey
                ) {
                  targetTypeEnv[targetKey].value.from = srcTypeEnv[srcKey];
                }
              }
              // to checking
              if (
                targetTypeEnv[targetKey].value.to ===
                Object(targetTypeEnv[targetKey].value.to)
              ) {
                targetTypeEnv[targetKey].value.to = unification(
                  srcTypeEnv,
                  targetTypeEnv[targetKey].value.to
                );
              } else {
                if (
                  targetTypeEnv[targetKey].value.to.key == "*" &&
                  targetTypeEnv[targetKey].value.to.value == srcKey
                ) {
                  targetTypeEnv[targetKey].value.to = srcTypeEnv[srcKey];
                }
              }
              break;
            }

          }
        }
      });
    });
  }
  return targetTypeEnv;
}
