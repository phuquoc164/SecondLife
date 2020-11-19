export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)/gm;
  return regex.test(email);
};

export const verifyData = (object) => {
  let isError = false;
  Object.keys(object).forEach((property) => {
    if (!!object[property]) {
      switch (typeof object[property]) {
        case 'string': {
          if (
            (property === 'email' && !validateEmail(object[property])) ||
            (property !== 'email' && object[property] === '')
          ) {
            isError = true;
          }
          break;
        }
        case 'object': {
          if (
            (Array.isArray(object[property]) &&
              object[property].length === 0) ||
            (!Array.isArray(object[property]) &&
              Object.keys(object[property]).length === 0)
          ) {
            isError = true;
          }
          break;
        }
        default: {
          isError = true;
        }
      }
    } else {
      isError = true;
    }
  });

  return isError;
};
const uppercaseFirstLetter = (string) => {
  const uppercaseFirstLetter = string.charAt(0).toUpperCase();
  const stringWithoutFirstLetter = string.slice(1);
  return uppercaseFirstLetter + stringWithoutFirstLetter;
};

export const toUppercaseKeys = (object) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[uppercaseFirstLetter(key)] = object[key];
  });
  return newObject;
};

export const createSku = () => {
  return 'xxxxxxxxxx'.replace(/[x]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const formatListProducts = (listProducts) => {
  const listProductsSold = [];
  const listProductsHaventSold = [];

  listProducts.forEach(product => {
    const data = {
      ...product.customer,
      ...product.product,
      uri: product.uri.sold,
    };
    if (product["product"].sold) {
      listProductsSold.push(data);
    } else {
      listProductsHaventSold.push(data);
    }
  });

  return {listProductsSold, listProductsHaventSold};
}