export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)/gm;
  return regex.test(email);
};

export const verifyData = (object) => {
  let isError = false;
  Object.keys(object).forEach((property) => {
    if (!!object[property] || property === "sold") {
      if (property === "sold" || property === "description") {
        return;
      } else {
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
            break;
          }
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

export const formatListProducts = (listProducts) => {
  const listProductsSold = [];
  const listProductsHaventSold = [];

  listProducts.forEach((singleProduct) => {
    const {product, customer, uri} = singleProduct;
    const data = {
      customer,
      product,
      uri: uri.sold,
      sku: product.sku,
    };
    if (product.sold) {
      listProductsSold.push(data);
    } else {
      listProductsHaventSold.push(data);
    }
  });

  return {listProductsSold, listProductsHaventSold};
};

export const formatListCustomers = (listCustomers) => {
  const customers = [];
  const listLastNames = [];
  const listFirstNames = [];
  const listEmails = [];
  listCustomers.forEach((customer) => {
    const key = `${customer.firstName} ${customer.lastName} - ${customer.email}`;
    if (!customers[key]) {
      customers[key] = customer;
    }
    if (!listLastNames.includes(customer.lastName)) {
      listLastNames.push(customer.lastName);
    }
    if (!listFirstNames.includes(customer.firstName)) {
      listFirstNames.push(customer.firstName);
    }
    if (!listEmails.includes(customer.email)) {
      listEmails.push(customer.email);
    }
  });

  return {customers, listLastNames, listFirstNames, listEmails};
};

export const filterArray = (array, filtered, limit = 5) => {
  if (!filtered || filtered === '') return array.slice(0, limit);
  const newArray = array.filter((singleData) =>
    singleData.toLowerCase().includes(filtered.toLowerCase()),
  );
  return newArray.slice(0, limit);
};

export const convertFormDatatoRequestData = (information, article) => ({
  firstName: information.firstName,
  lastName: information.lastName,
  birthdayDate: information.birthdayDate,
  address: information.address,
  zipCode: information.zipCode,
  city: information.city,
  phone: information.phone,
  email: information.email,
  products: [
    {
      name: article.name,
      sku: article.reference,
      description: article.description,
      voucherAmount: parseFloat(article.voucherAmount.replace(' €', '')),
      price: parseFloat(article.price.replace(' €', '')),
      category: article.category.Id.replace(
        '/{manufacturer}/',
        `/${article.brand.Name}/`,
      ),
      reference: article.reference,
      pictures: article.pictures.map((photo, index) => ({
        name: `image${index + 1}`,
        content: photo,
      })),
      size: article.size,
      state: article.state.Name,
    },
  ],
});
