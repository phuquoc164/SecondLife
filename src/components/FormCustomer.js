/** React */
import React from "react";
import { Image, View, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import { convertDateToString } from "../lib/Helpers";
import CustomDateTimePicker from "./CustomDateTimePicker";

let initialDate = new Date();
initialDate.setFullYear(initialDate.getFullYear() - 18);

const FormCustomer = (props) => {
    const [customer, setCustomer] = React.useState(props.customer);
    const [showCalender, setShowCalendar] = React.useState(false);

    const birthdayRef = React.useRef({
        value: customer.birthday ? new Date(customer.birthday) : initialDate,
        color: customer.birthday ? styles.textDarkBlue : styles.textMediumGray
    });

    return (
        <SafeAreaView>
            <KeyboardAwareScrollView>
                <View style={componentStyle.inputContainer}>
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
                        onChangeText={(firstname) => setCustomer({ ...customer, firstname })}
                    />
                </View>
                <View style={componentStyle.inputContainer}>
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
                        onChangeText={(lastname) => setCustomer({ ...customer, lastname })}
                    />
                </View>
                <View style={componentStyle.inputContainer}>
                    <View style={componentStyle.imageContainer}>
                        <Image source={require("../assets/images/birthday.png")} style={{ width: 25, height: 29.3 }} />
                    </View>
                    {props.editable ? (
                        <TouchableOpacity onPress={() => setShowCalendar(true)}>
                            <Text style={[birthdayRef.current.color, styles.font20, componentStyle.input, { paddingVertical: 7 }]}>
                                {convertDateToString(birthdayRef.current.value)}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[birthdayRef.current.color, styles.font20, componentStyle.input, { paddingVertical: 7 }]}>
                            {convertDateToString(birthdayRef.current.value)}
                        </Text>
                    )}
                </View>
                <View style={componentStyle.inputContainer}>
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
                        onChangeText={(phone) => setCustomer({ ...customer, phone })}
                    />
                </View>
                <View style={componentStyle.inputContainer}>
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
                        value={customer.email}
                        onChangeText={(email) => setCustomer({ ...customer, email })}
                    />
                </View>
                <View style={componentStyle.inputContainer}>
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
                        onChangeText={(address) => setCustomer({ ...customer, address })}
                    />
                </View>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 30 }}>
                    <View style={componentStyle.smallContainer}>
                        <TextInput
                            editable={props.editable}
                            style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                            placeholder="Postal Code"
                            placeholderTextColor={colors.mediumGray}
                            autoCompleteType="postal-code"
                            value={customer.zipCode}
                            onChangeText={(zipCode) => {
                                if (zipCode.length <= 5) {
                                    setCustomer({ ...customer, zipCode });
                                }
                            }}
                        />
                    </View>
                    <View style={componentStyle.smallContainer}>
                        <TextInput
                            editable={props.editable}
                            style={[styles.textDarkBlue, styles.font20, componentStyle.input]}
                            placeholder="Ville"
                            placeholderTextColor={colors.mediumGray}
                            value={customer.city}
                            onChangeText={(city) => setCustomer({ ...customer, city })}
                        />
                    </View>
                </View>
                {props.editable && (
                    <View style={{ marginBottom: 40, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => props.handleSubmit(customer)} style={[styles.greenScreen, componentStyle.btnSubmit]}>
                            <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaRegular]}>{props.btnSubmitTitle}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAwareScrollView>
            <CustomDateTimePicker
                visible={showCalender}
                date={birthdayRef.current.value}
                onCancel={() => setShowCalendar(false)}
                onValidate={(birthday) => {
                    setShowCalendar(false);
                    setCustomer({ ...customer, birthday: convertDateToString(birthday) });
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
        marginHorizontal: 30,
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
        paddingHorizontal: 20
    },
    smallContainer: {
        width: "46%",
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 15,
        paddingVertical: 7
    },
    btnSubmit: {
        marginHorizontal: 30,
        borderRadius: 10,
        paddingVertical: 15
    }
});

export default FormCustomer;
