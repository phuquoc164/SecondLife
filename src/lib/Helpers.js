/** React*/
import React from "react";
import { ActivityIndicator, View, Image, Text, TextInput } from "react-native";

/** App */
import styles from "../assets/css/styles";
import CustomModal from "../components/CustomModal";
import { colors } from "./colors";
import { monthNames } from "./constants";

/**
 * Verify if the champ have form of email
 * @param {*} email
 */
export const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)/gm;
    return regex.test(email);
};

/**
 * component loading
 */
export const loading = () => (
    <View style={styles.mainScreen}>
        <ActivityIndicator size="large" color="#171717" style={{ marginVertical: 20 }} />
    </View>
);

export const loadingScreen = (visible) => (
    <CustomModal
        visible={visible}
        rootViewStyle={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        containerViewStyle={{
            alignItems: "center",
            position: "relative",
            backgroundColor: "transparent",
            borderRadius: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0
        }}>
        <View style={{ justifyContent: "center" }}>
            <ActivityIndicator color={colors.white} size="large" />
            <Text style={[styles.font18, styles.fontSofiaRegular, styles.textWhite, { marginVertical: 10 }]}>Chargement...</Text>
        </View>
    </CustomModal>
);

/**
 * component input filter
 * @param {*} props
 */
export const InputSearch = (props) => (
    <View style={styles.inputContainer}>
        <Image source={require("../assets/images/search.png")} style={styles.imageSearch} />
        <TextInput
            numberOfLines={1}
            style={styles.inputSearch}
            autoCapitalize="none"
            placeholder={props.placeholder}
            placeholderTextColor={props.placeholderTextColor}
            value={props.value}
            onChangeText={(filter) => props.filterData(filter)}
        />
    </View>
);

/**
 * format date
 * @param date
 * @param withOptions
 */
export const convertDateToDisplay = (date, isMonthText = false) => {
    if (date) {
        const dateObject = new Date(date);
        const dd = String(dateObject.getDate()).padStart(2, "0");
        const monthInNumber = dateObject.getMonth();
        const mm = String(monthInNumber + 1).padStart(2, "0");
        const yyyy = dateObject.getFullYear();
    
        return isMonthText ? dd + " " + monthNames[monthInNumber] + " " + yyyy : dd + "/" + mm + "/" + yyyy;
    }
    return '';
};

/**
 * format date to send api
 * @param {*} date
 * @returns
 */
export const convertDateToApi = (date) => new Date(date).toISOString().slice(0, 10);

export const getSimpleDiff = (oldObject, newObject) => {
    const diffs = {};
    Object.keys(oldObject).forEach((key) => {
        if (oldObject[key] !== newObject[key]) {
            diffs[key] = newObject[key];
        }
    });

    return diffs;
};

export const verifyProduct = (product) => {
    const listErreur = [];
    Object.keys(product).forEach(key => {
        if (key === "price" || key === "reference") continue;
        if (key === "images" && (!product.images || product.image.length ===0)) {
            listErreur.push("image");
        } else if (key === "name" && key==="description" && (!product[key] || product[key] === "")) {
            listErreur.push(key);
        } else if (key === "voucher" && (!product.voucherAmount || product.voucherAmount === "0" || product.voucherAmount === "")) {
            listErreur.push("voucher");
        } else if (!product[key]) {
            listErreur.push(key);
        }
    });
    return listErreurs;
}

// ============================================
export const verifyData = (object) => {
    let isError = false;
    Object.keys(object).forEach((property) => {
        if (property !== "sold" && property !== "description") {
            if (!!object[property]) {
                switch (typeof object[property]) {
                    case "string": {
                        if ((property === "email" && !validateEmail(object[property])) || (property !== "email" && object[property] === "")) {
                            isError = true;
                        }
                        break;
                    }
                    case "object": {
                        if (
                            (Array.isArray(object[property]) && object[property].length === 0) ||
                            (!Array.isArray(object[property]) && Object.keys(object[property]).length === 0)
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
            } else {
                isError = true;
            }
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
        const { product, customer, uri } = singleProduct;
        const data = {
            customer,
            product,
            uri: uri.sold,
            sku: product.sku
        };
        if (product.sold) {
            listProductsSold.push(data);
        } else {
            listProductsHaventSold.push(data);
        }
    });

    return { listProductsSold, listProductsHaventSold };
};

export const filterArray = (array, filtered, limit = 5) => {
    if (!filtered || filtered === "") return array.slice(0, limit);
    const newArray = array.filter((singleData) => singleData.toLowerCase().includes(filtered.toLowerCase()));
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
            description: article.description ? article.description : "",
            voucherAmount: parseFloat(article.voucherAmount.replace(" €", "")),
            price: parseFloat(article.price.replace(" €", "")),
            category: article.category,
            brand: article.brand.Name,
            reference: article.reference,
            pictures: article.pictures.map((photo, index) => ({
                name: `image${index + 1}`,
                content: photo
            })),
            size: article.size,
            state: article.state.Name
        }
    ]
});
