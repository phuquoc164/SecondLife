export const STORAGE_USER = "storage_user";

export const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juiilet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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
    voucherAmount: null,
    seller: null,
    reference: null
};

export const stateDict = {
    GOOD: "Bon état",
    "VERY-GOOD": "Très bon état",
    "NEW-WITHOUT-LABEL": "Neuf sans étiquette",
    "NEW-WITH-LABEL": "Neuf avec étiquette"
};

export const TITLE = {
    clients: ["Clients", "Informations client", "Modifier les informations"],
    catalog: ["Inventaire Once Again", "Catalogue rayon", "Mes dons\xa0 ♥️"],
    voucher: ["Bon d'achat", "Historique"],
    profil: ["Compte"],
    products: ["Nouveau Lifer", "Trouver un client", "Informations client", "Ajouter un produit"]
};

export const SHIPMENT_STATUS = {
    inProgress: "En courrs d'envoi",
    shipped: "Expédié",
    done: "Reçu"
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
