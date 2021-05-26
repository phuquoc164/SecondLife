export const STORAGE_USER = "storage_user";

export const initialCustomer = { 
    firstname: null, 
    lastname: null, 
    birthday: null, 
    phone: null, 
    email: null, 
    address: null, 
    zipCode: null, 
    city: null 
};

export const initialProduct = {
    name: null,
    images: [],
    brand: null,
    category: null,
    size: null,
    state: null,
    description: null,
    price: null,
    seller: null
}

export const stateDict = {
    GOOD: "Bon état",
    "VERY-GOOD": "Très bon état",
    "NEW-WITHOUT-LABEL": "Neuf sans étiquette",
    "NEW-WITH-LABEL": "Neuf avec étiquette"
};

// ==============================
export const initialInformation = {
    firstName: null,
    lastName: null,
    birthdayDate: null,
    address: null,
    zipCode: null,
    city: null,
    email: null,
    phone: null
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
        uri: "",
        width: 31,
        height: 25
    },
    Femmes: {
        uri: "",
        width: 18,
        height: 26
    }
};

export const listStates = [
    {
        Id: "good_status",
        Name: "Bon état"
    },
    {
        Id: "very_good_status",
        Name: "Très bon état"
    },
    {
        Id: "good_without_tag",
        Name: "Neuf sans étiquette"
    },
    {
        Id: "good_with_tag",
        Name: "Neuf avec étiquette"
    }
];
