export function extractAndUpdateTermType(typeConstraintEnv, targetType, inputType) {
  let newType = Object.assign({}, targetType);
  let newInputType = Object.assign({}, inputType);
  switch (newType.key) {
    case "*": {
      if (newInputType.key != "*") {
        if (newType.value != "*" && !typeConstraintEnv[newType.value]) {
          typeConstraintEnv[newType.value] = newInputType;
        }
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
            from: extractAndUpdateTermType(typeConstraintEnv, newType.value.from, newInputType.value.from),
            to: extractAndUpdateTermType(typeConstraintEnv, newType.value.from, newInputType.value.from),
          },
        };
      }
      break;
    }
    case "list": {
      if (newInputType.key == "list") {
        let x = {
          key: "list",
          value: extractAndUpdateTermType(typeConstraintEnv, newType.value, newInputType.value),
        };
        return x;
      }
      break;
    }
    case "tuple": {
      if (newInputType.key == "tuple") {
        if (Object.keys(newType.value).length > 0) {
          if (newType.value["key"]) {
            if (newType.value["key"] == "*") {
              return newInputType;
            }
          }
          // if (newTypeLength == Object.keys(newInputType.value).length) {
          else
            for (let i in newInputType.value) {
              if (newType.value[i]) {
                newType.value[i] = extractAndUpdateTermType(typeConstraintEnv,
                  newType.value[i],
                  newInputType.value[i]
                );
              } else {
                newType.value[i] = newInputType.value[i];
              }
            }
          return newType;
          // }
        }
      }
    }
    case "record": {
      if (newInputType.key == "record") {
        if (Object.keys(newType.value).length > 0) {
          if (newType.value["key"]) {
            if (newType.value["key"] == "*") {
              return newInputType;
            }
          } else
            for (let i in newInputType.value) {
              if (newType.value[i]) {
                newType.value[i] = extractAndUpdateTermType(typeConstraintEnv,
                  newType.value[i],
                  newInputType.value[i]
                );
              } else {
                newType.value[i] = newInputType.value[i];
              }
            }
          return newType;
          // }
        }
      }
    }
    default:
      return newType;
  }
  return newType;
}
