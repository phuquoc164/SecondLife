/** React */
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import FetchService from "../../lib/FetchService";
import { loading } from "../../lib/Helpers";

const CustomerDetail = (props) => {
    const [customer, setCustomer] = React.useState(null);
    const { user } = React.useContext(AuthContext);
    const token = user.token;

    React.useEffect(() => {
        if (props.route.params.customerId) {
            getCustomer(props.route.params.customerId);
        } else if (props.route.params.customer) {
            setCustomer({ ...props.route.params.customer, "@id": customer["@id"] });
        }
    }, [props.route.params]);

    const getCustomer = (customerId) => {
        FetchService.get(customerId, token)
            .then((result) => {
                if (result) {
                    setCustomer(result);
                }
            })
            .catch((error) => {
                console.error(error);
                // TODO: change text
                Alert.alert("Error");
            });
    };

    if (!customer) return loading();
    return (
        <ScrollView style={styles.mainScreen}>
            <View style={componentStyle.informationContainer}>
                <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textDarkBlue]}>{`${customer.firstname} ${customer.lastname}`}</Text>
                {/* Data Customer */}
                <View style={componentStyle.subInformationContainer}>
                    <View style={componentStyle.singleInformation}>
                        <Image source={require("../../assets/images/email.png")} style={{ width: 25, height: 23.6 }} />
                        <Text style={componentStyle.text}>{customer.email}</Text>
                    </View>

                    <View style={componentStyle.singleInformation}>
                        <Image source={require("../../assets/images/phone.png")} style={{ width: 25, height: 21.7 }} />
                        <Text style={componentStyle.text}>{customer.phone}</Text>
                    </View>

                    <View style={componentStyle.singleInformation}>
                        <Image source={require("../../assets/images/birthday.png")} style={{ width: 25, height: 29.3 }} />
                        <Text style={componentStyle.text}>{customer.birthdayDateFormatted}</Text>
                    </View>

                    <View style={componentStyle.singleInformation}>
                        <Image source={require("../../assets/images/home.png")} style={{ width: 25, height: 25.8 }} />
                        <Text style={componentStyle.text}>{`${customer.address}, ${customer.zipCode} ${customer.city}`}</Text>
                    </View>
                </View>
                {/* Button Modifier */}
                <TouchableOpacity style={componentStyle.btnModif} onPress={() => props.navigation.navigate("Customer", { screen: "ModifyCustomer", params: { customer } })}>
                    <Text style={[styles.font24, styles.fontSofiaRegular, styles.textWhite, styles.textCenter]}>Modifier</Text>
                </TouchableOpacity>
            </View>

            <View style={[componentStyle.informationContainer, { borderWidth: 1, marginBottom: 90 }]}>
                <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textDarkBlue]}>Historique des bons d'achat:</Text>
                <View style={componentStyle.productsContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            props.navigation.navigate("Voucher", {
                                screen: "ActifVouchers",
                                params: { customer, fromBottomMenu: false }
                            })
                        }
                        style={[componentStyle.singleProduct, { borderColor: colors.green }]}>
                        <Text style={[componentStyle.nbProducts, styles.textGreen]}>{customer.availableVouchers.length}</Text>
                        <View style={[styles.divisionHorizontal, { backgroundColor: colors.green }]}></View>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaSemiBold, styles.textCenter, componentStyle.subText]}>Actif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            props.navigation.navigate("Voucher", {
                                screen: "InactifVouchers",
                                params: { customer, fromBottomMenu: false }
                            })
                        }
                        style={[componentStyle.singleProduct, { borderColor: colors.darkBlue }]}>
                        <Text style={[componentStyle.nbProducts, styles.darkBlue]}>{customer.vouchers.length - customer.availableVouchers.length}</Text>
                        <View style={[styles.divisionHorizontal, { backgroundColor: colors.darkBlue }]}></View>
                        <Text style={[styles.font18, styles.textGreen, styles.fontSofiaSemiBold, styles.textCenter, componentStyle.subText]}>Inactif</Text>
                    </TouchableOpacity>
                    <View style={componentStyle.divisionVertical} />
                </View>
            </View>
        </ScrollView>
    );
};

const componentStyle = StyleSheet.create({
    informationContainer: {
        backgroundColor: colors.white,
        margin: 20,
        marginBottom: 5,
        borderRadius: 20,
        padding: 20,
        borderColor: colors.gray
    },
    subInformationContainer: {
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20
    },
    singleInformation: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5
    },
    text: {
        fontFamily: "SofiaPro-Medium",
        fontSize: 15,
        color: colors.mediumGray,
        paddingLeft: 20
    },
    productsContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        position: "relative"
    },
    singleProduct: {
        width: "45%",
        borderRadius: 20,
        borderColor: colors.green,
        borderWidth: 2,
        paddingHorizontal: 10
    },
    nbProducts: {
        fontSize: 45,
        fontFamily: "SofiaPro-SemiBold",
        textAlign: "center",
        paddingBottom: 5
    },
    subText: {
        paddingVertical: 15
    },
    btnModif: {
        borderRadius: 15,
        backgroundColor: colors.green,
        width: "80%",
        paddingVertical: 10,
        marginLeft: "10%",
        marginTop: 20
    },
    divisionVertical: {
        width: 1,
        height: "80%",
        backgroundColor: colors.gray,
        position: "absolute",
        top: "10%",
        left: "50%",
        marginVertical: "auto"
    }
});

export default CustomerDetail;
