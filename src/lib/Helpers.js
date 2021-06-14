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
    return "";
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
    const listErreurs = [];
    Object.keys(product).forEach((key) => {
        if (key === "price" || key === "reference") return;
        if (key === "images" && (!product.images || product.images.length === 0)) {
            listErreurs.push("images");
        } else if (key === "name" && key === "description" && (!product[key] || product[key] === "")) {
            listErreurs.push(key);
        } else if (key === "voucherAmount" && (!product.voucherAmount || product.voucherAmount === "0" || product.voucherAmount === "")) {
            listErreurs.push("voucherAmount");
        } else if (!product[key]) {
            listErreurs.push(key);
        }
    });
    return listErreurs;
};

export const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}

/**
 * @deprecated
 */
export const filterArray = (array, filtered, limit = 5) => {
    if (!filtered || filtered === "") return array.slice(0, limit);
    const newArray = array.filter((singleData) => singleData.toLowerCase().includes(filtered.toLowerCase()));
    return newArray.slice(0, limit);
};

// The component to display image slide
{/* <ScrollView
    horizontal={true}
    contentContainerStyle={{ width: `${100 * (nbImages <= 3 ? 1 : 2)}%` }}
    showsHorizontalScrollIndicator={false}
    scrollEventThrottle={200}
    decelerationRate="fast">
    {product.product.pictures.map((picture) => (
        <View
            key={picture.name}
            style={{
                width: `${100 / nbImages}%`,
                maxWidth: "50%",
                aspectRatio: 1,
                padding: 5
            }}>
            <Image
                source={{
                    uri: "data:image/png;base64," + picture.content
                }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
        </View>
    ))}
</ScrollView>; */}