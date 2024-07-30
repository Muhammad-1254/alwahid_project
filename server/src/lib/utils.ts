import { User } from "src/user/entities/user.entity";

export const userDataResponse = (user: User) => {
  return {
    userId: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatarUrl,
    age: user.age,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    role: user.userRole,
    dob: user.dateOfBirth,
    authProvider: user.authProvider,
    isVerified: user.isVerified,
    isSpecialUser: user.isSpecialUser,
  };
};

export const prefixSplitNestingObject = (data: any) => {
  const result: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // Split the key by underscore
      const parts = key.split("_");
      const prefix = parts[0];
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
