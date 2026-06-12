/**
 * @license
 * Copyright MnL 2020-2025
 * SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE
 * @author Macacanigra PL (macacanigra.pl@gmail.com)
 * @fileoverview
 */

// Generating  visually distinct colors from https://mokole.com/palette.html
// 30 colour, 1% minimum luminosity, 80% max luminosity, 5000 max loops 
const COLOR_STRING = "#228b22"; // forestgreen
const COLOR_UNIT = "#800000"; // maroon
const COLOR_CHARACTER = "#808000"; // olive
const COLOR_NUMBER = "#FED049"; // darkyellow
const COLOR_BOOLEAN = "#f08080"; // lightcoral
const COLOR_LIST = "#000075"; // navy
const COLOR_TUPLE = "#911eb4"; // purple
const COLOR_RECORD = "#ff8c00"; //darkorange
const COLOR_ANY = "#778899"; // lightslategray
const COLOR_TYPE_VARIABLE = "#2f4f4f"; // darkslategray
const COLOR_NOTHING = "#008b8b"; // darkcyan
const COLOR_FUNCTION = "#4363d8"; // blue
const COLOR_MATCH = "#9A6324"; // brown 
const COLOR_ERROR = "#ff0000"; // red
const MAIN_FILE = "#000000"; // black
const COLOR_EXPS = "#61677A"; // davysgrey
const COLOR_EXP = "#778899"; // lightslategray
const COLOR_DESIGN = "#2F89FC"; // vividblue
const COLOR_DESCRIPTION = "#00b13b"; // vividgreen

export function getColorByType(type) {
  if (!(type.key !== undefined))
    return COLOR_ERROR;

  switch (type.key) {
    case "*":
      if (type.value == "*")
        return COLOR_ANY;
      else
        return COLOR_TYPE_VARIABLE;
    case "primitive":
      switch (type.value) {
        case "number":
          return COLOR_NUMBER;
        case "string":
          return COLOR_STRING;
        case "character":
          return COLOR_CHARACTER;
        case "boolean":
          return COLOR_BOOLEAN;
        case "unit":
          return COLOR_UNIT;
        default:
          return COLOR_ERROR;
      }
    case "function":
      return COLOR_FUNCTION;
    case "list":
      return COLOR_LIST;
    case "tuple":
      return COLOR_TUPLE;
    case "record":
      return COLOR_RECORD;
    case "exps":
      return COLOR_EXPS;
    case "exp":
      return COLOR_EXP;
    case "match":
      return COLOR_MATCH;
    case "nothing":
      return COLOR_NOTHING;
    case "field":
      return getColorByType(type.value.fValue);
    case "BlockMainFile":
      return MAIN_FILE;
    case "design":
      return COLOR_DESIGN;
    case "DescriptionBlock":
      return COLOR_DESCRIPTION;
    default:
      return COLOR_ERROR;
  }
}
