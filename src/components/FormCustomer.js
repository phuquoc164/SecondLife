/** React */
import React from "react";
import { Image, View, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Text, Platform, ActivityIndicator, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import { initialCustomer } from "../lib/constants";
import { convertDateToApi, convertDateToDisplay } from "../lib/Helpers";
import CustomDateTimePicker from "./CustomDateTimePicker";

let initialDate = new Date();
initialDate.setFullYear(initialDate.getFullYear() - 18);

const FormCustomer = (props) => {
    const [customer, setCustomer] = React.useState({
        ...props.customer,
        hasModifiedData: false
    });
    const [showCalender, setShowCalendar] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [listErrors, setListErrors] = React.useState([]);

    const birthdayRef = React.useRef({
        value: customer.birthday ? new Date(customer.birthday) : initialDate,
        color: customer.birthday ? styles.textDarkBlue : styles.textMediumGray
    });

    React.useEffect(() => {
        if (props.timestamp && customer.hasModifiedData) {
            setCustomer({
                ...initialCustomer,
                hasModifiedData: false
            });
            birthdayRef.current = {
                value: initialDate,
                color: styles.textMediumGray
            };
        }
    }, [props.timestamp]);

    const handleAddCustomer = () => {
        setIsSubmitted(true);
        let listErrors = [];
        Object.keys(initialCustomer).forEach((key) => {
            if (!props.hasReferenceField && key === "reference") return;

            if (!customer[key] || customer.key === "") {
                listErrors.push(key);
            }
        });
        setListErrors(listErrors);
        if (listErrors.length > 0) {
            Alert.alert("Erreur", "Veuillez renseigner tous les champs encadrés en rouge");
            setIsSubmitted(false);
        } else {
            const { hasModifiedData, ...data } = customer;
            props.handleSubmit(
                data,
                () => setIsSubmitted(false),
                () => setCustomer({ ...customer, reference: null }) // reset reference
            );
        }
    };

    return (
        <SafeAreaView>
            <KeyboardAwareScrollView>
                {/* Référence */}
                {props.hasReferenceField && (
                    <View style={[componentStyle.inputContainer, listErrors.includes("reference") && { borderColor: colors.red }]}>
                        <View style={componentStyle.imageContainer}>{/* <Image source={require("../assets/images/name.png")} style={{ width: 20, height: 30.8 }} /> */}</View>
                        <TextInput
                            editable={props.editable}
                            style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                            placeholder="Référence"
                            placeholderTextColor={colors.mediumGray}
                            value={customer.reference}
                            onChangeText={(reference) => setCustomer({ ...customer, reference, hasModifiedData: true })}
                        />
                    </View>
                )}

                {/* Prénom */}
                <View style={[componentStyle.inputContainer, listErrors.includes("firstname") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/name.png")} style={{ width: 20, height: 30.8 }} />
                    </View>
                    <TextInput
                        editable={props.editable}
                        style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                        placeholder="Prénom"
                        placeholderTextColor={colors.mediumGray}
                        value={customer.firstname}
                        autoCapitalize="words"
                        onChangeText={(firstname) => setCustomer({ ...customer, firstname, hasModifiedData: true })}
                    />
                </View>

                {/* Nom */}
                <View style={[componentStyle.inputContainer, listErrors.includes("lastname") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/name.png")} style={{ width: 25, height: 30.8 }} />
                    </View>
                    <TextInput
                        editable={props.editable}
                        style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                        placeholder="Nom"
                        placeholderTextColor={colors.mediumGray}
                        value={customer.lastname}
                        autoCapitalize="characters"
                        onChangeText={(lastname) => setCustomer({ ...customer, lastname, hasModifiedData: true })}
                    />
                </View>

                {/* Birthday */}
                <View style={[componentStyle.inputContainer, listErrors.includes("birthday") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/birthday.png")} style={{ width: 25, height: 29.3 }} />
                    </View>
                    {props.editable ? (
                        <TouchableOpacity onPress={() => setShowCalendar(true)}>
                            <Text style={[birthdayRef.current.color, styles.font20, componentStyle.input, { paddingVertical: 7 }]}>
                                {convertDateToDisplay(birthdayRef.current.value)}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[birthdayRef.current.color, styles.font20, componentStyle.input, { paddingVertical: 7 }]}>
                            {convertDateToDisplay(birthdayRef.current.value)}
                        </Text>
                    )}
                </View>

                {/* Phone */}
                <View style={[componentStyle.inputContainer, listErrors.includes("phone") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/phone.png")} style={{ width: 30, height: 26.1 }} />
                    </View>
                    <TextInput
                        editable={props.editable}
                        style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                        placeholder="Phone"
                        placeholderTextColor={colors.mediumGray}
                        keyboardType="phone-pad"
                        autoCompleteType="tel"
                        value={customer.phone}
                        onChangeText={(phone) => setCustomer({ ...customer, phone, hasModifiedData: true })}
                    />
                </View>

                {/* Email */}
                <View style={[componentStyle.inputContainer, listErrors.includes("email") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/email.png")} style={{ width: 30, height: 28.3 }} />
                    </View>
                    <TextInput
                        editable={props.editable}
                        style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                        placeholder="Email"
                        placeholderTextColor={colors.mediumGray}
                        keyboardType="email-address"
                        autoCompleteType="email"
                        autoCapitalize="none"
                        value={customer.email}
                        onChangeText={(email) => setCustomer({ ...customer, email, hasModifiedData: true })}
                    />
                </View>

                {/* Address */}
                <View style={[componentStyle.inputContainer, listErrors.includes("address") && { borderColor: colors.red }]}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/home.png")} style={{ width: 30, height: 30.9 }} />
                    </View>
                    <TextInput
                        editable={props.editable}
                        style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                        placeholder="Adresse"
                        placeholderTextColor={colors.mediumGray}
                        autoCompleteType="street-address"
                        value={customer.address}
                        onChangeText={(address) => setCustomer({ ...customer, address, hasModifiedData: true })}
                    />
                </View>

                {/* Code postal */}
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginHorizontal: 20
                    }}>
                    <View style={[componentStyle.smallContainer, listErrors.includes("zipCode") && { borderColor: colors.red }]}>
                        <TextInput
                            editable={props.editable}
                            style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                            placeholder="Code Postal"
                            keyboardType="decimal-pad"
                            placeholderTextColor={colors.mediumGray}
                            autoCompleteType="postal-code"
                            value={customer.zipCode}
                            onChangeText={(zipCode) => {
                                if (zipCode.length <= 5) {
                                    setCustomer({ ...customer, zipCode, hasModifiedData: true });
                                }
                            }}
                        />
                    </View>
                    <View style={[componentStyle.smallContainer, listErrors.includes("city") && { borderColor: colors.red }]}>
                        <TextInput
                            editable={props.editable}
                            style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                            placeholder="Ville"
                            placeholderTextColor={colors.mediumGray}
                            value={customer.city}
                            onChangeText={(city) => setCustomer({ ...customer, city, hasModifiedData: true })}
                        />
                    </View>
                </View>
                {props.editable && (
                    <View style={{ marginBottom: 40, marginTop: 20 }}>
                        {isSubmitted ? (
                            <View style={[styles.greenScreen, componentStyle.btnSubmit]}>
                                <ActivityIndicator color="#ffffff" />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleAddCustomer} style={[styles.greenScreen, componentStyle.btnSubmit]}>
                                <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaRegular]}>{props.btnSubmitTitle}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </KeyboardAwareScrollView>
            <CustomDateTimePicker
                visible={showCalender}
                date={birthdayRef.current.value}
                onCancel={() => setShowCalendar(false)}
                onValidate={(birthday) => {
                    setShowCalendar(false);
                    setCustomer({ ...customer, birthday: convertDateToApi(birthday), hasModifiedData: true });
                    birthdayRef.current = {
                        value: birthday,
                        color: styles.textDarkBlue
                    };
                }}
            />
        </SafeAreaView>
    );
};

const componentStyle = StyleSheet.create({
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 10
    },
    imageContainer: {
        width: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center"
    },
    input: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === "ios" ? 10 : 5
    },
    smallContainer: {
        width: "46%",
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 15,
        paddingVertical: 7
    },
    btnSubmit: {
        marginHorizontal: 20,
        borderRadius: 10,
        paddingVertical: 15
    }
});

export default FormCustomer;
