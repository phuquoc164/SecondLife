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
    subTitle:
      "Un article porté/utilisé quelques fois, montre des imperfections et des signes d'usure. Précise avec des photos et une description détaillée, les défauts de ton article",
  },
  {
    Id: 'very_good_status',
    Name: 'Très bon état',
    subTitle:
      'Un article très peu porté/utilisé qui peut avoir de légères imperfections, mais qui reste en très bon état. Précise avec des photos et une description détaillée, les défauts de ton article',
  },
  {
    Id: 'good_without_tag',
    Name: 'Neuf sans étiquette',
    subTitle: "Article neuf, jamais porté/utilisé, sans étiquettes ni emballage d'origine"
  },
  {
    Id: 'good_with_tag',
    Name: 'Neuf avec étiquette',
    subTitle: "Article neuf, jamais porté/utilisé, avec étiquettes ou dans son emballage d'origine"
  },
];
