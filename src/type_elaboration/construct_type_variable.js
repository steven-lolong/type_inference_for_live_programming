/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview Construct type variable
 */

export function constructTypeVariable(typeVarCounter) {
  if (typeVarCounter.a < 0) {
    return "*";
  }
  return "'" + countTheAlphabet(typeVarCounter.a + 0);
}

function countTheAlphabet(a_counter) {
  if (Math.floor(a_counter / 26) > 0) {
    return (countTheAlphabet(Math.floor(a_counter / 26) - 1) +
      countTheAlphabet(a_counter % 26)
    );
  } else {
    return String.fromCharCode("A".charCodeAt() + a_counter);
  }
}

