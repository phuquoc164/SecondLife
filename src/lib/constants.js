export const STORAGE_KEY = 'storage_key';
export const STORAGE_USER = 'storage_user';

export const initialInformation = {
  firstName: null,
  lastName: null,
  birthdayDate: null,
  address: null,
  zipCode: null,
  city: null,
  email: null,
  phone: null,
};

export const initialArticle = {
  pictures: [],
  reference: null,
  name: null,
  description: null,
  category: null,
  brand: null,
  size: null,
  state: null,
  price: null,
  voucherAmount: null
};

export const categoryIcons = {
  Homme: {
    uri: require('../assets/images/Homme.png'),
    width: 31,
    height: 25,
  },
  Femme: {
    uri: require('../assets/images/Femme.png'),
    width: 18,
    height: 26,
  },
  Enfant: {
    uri: require('../assets/images/Enfant.png'),
    width: 23.5,
    height: 23,
  },
};

export const listStates = [
  {
    Id: 'good',
    Name: 'Bon',
  },
  {
    Id: 'like_new',
    Name: 'Comme neuf',
  },
  {
    Id: 'excellent',
    Name: 'Excellent',
  },
];
