


export const prefixSplitNestingObject = (data: any, skipKey?:string) => {
  const result: any = {};
  for (const key in data) {
    
    if (data.hasOwnProperty(key)) {
      // Split the key by underscore
      const parts = key.split("_");
      const prefix = parts[0];
            if(skipKey &&(skipKey === prefix)) continue;
      const current = result;
      if (!current[prefix]) {
        current[prefix] = {};
      }

      let restKey = "";
      for (let i = 1; i < parts.length; i++) {
        if (restKey.length === 0) {
          restKey = restKey + parts[i];
        } else {
          restKey = restKey + "_" + parts[i];
        }
      }
      if (restKey.length === 0) {
        current[prefix] = data[key];
      } else {
        current[prefix][restKey] = data[key];
      }
    }
  }
  return result;
};
