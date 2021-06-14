export const STORAGE_USER = "storage_user";

export const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juiilet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
export const DOMAIN = "http://api-tsl.thunderstone.tech";
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
    title: null,
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
