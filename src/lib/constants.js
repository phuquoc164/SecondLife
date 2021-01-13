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
  Hommes: {
    uri: require('../assets/images/Homme.png'),
    width: 31,
    height: 25,
  },
  Femmes: {
    uri: require('../assets/images/Femme.png'),
    width: 18,
    height: 26,
  }
};

export const listStates = [
  {
    Id: 'good_status',
    Name: 'Bon état',
  },
  {
    Id: 'very_good_status',
    Name: 'Très bon état',
  },
  {
    Id: 'good_without_tag',
    Name: 'Neuf sans étiquette',
  },
  {
    Id: 'good_with_tag',
    Name: 'Neuf avec étiquette',
  },
];
