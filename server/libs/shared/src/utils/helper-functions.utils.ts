

export const prefixSplitNestingObject = (inputData: object, skipKey?:string[]) => {
    const isArray = Array.isArray(inputData)
    const data = isArray ? inputData[0]:inputData
    const result: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Split the key by underscore
        const parts = key.split("_");
        const prefix = parts[0];
              if(skipKey &&(skipKey.includes(prefix))) continue;
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
  
    // if data isArray then take result object and add array where result object keys-data is different
    if(!isArray) return result;
    skipKey?.forEach((skip)=>{
      for(let i =0 ;i<inputData.length;i++){
        const tempObj:any= {}
        for (const key in inputData[i]){
          const keyParts = key.split("_")
          if(keyParts[0] !== skip)continue
          if(!result.hasOwnProperty(skip)){
            result[skip] = []
          }
          tempObj[keyParts[1]] = inputData[i][key]
        }
        result[skip].push(tempObj)
      }
    })
  
  return result
    } 
   