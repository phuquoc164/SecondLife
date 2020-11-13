export const STORAGE_KEY = 'storage_key';
export const STORAGE_USER = 'storage_user';

export const initialInformation = {
  firstName: null,
  lastName: null,
  birthday: null,
  address: null,
  postalCode: null,
  city: null,
  email: null,
  telephone: null,
};

export const initialArticle = {
  photos: [],
  name: null,
  description: null,
  category: null,
  brand: null,
  size: null,
  state: null,
  price: null,
};

export const initialListData = [
  {
    Id: 'no_data',
    Name: 'Pas de données',
  },
];

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
