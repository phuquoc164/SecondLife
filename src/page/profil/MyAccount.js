/** React */
import React from "react";
import { Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";

const MyAccount = () => {
    const { user, signOut } = React.useContext(AuthContext);

    return (
        <SafeAreaView style={styles.mainScreen}>
            <ScrollView>
                <View style={componentStyle.logoContainer}>
                    <Image source={require("../../assets/images/The-Second-Life-NOIR.png")} style={{ width: 160, height: 81.9 }} />
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, componentStyle.borderBottom]}>Informations personnelles</Text>
                    <View style={[componentStyle.singleInfo, componentStyle.borderBottom]}>
                        <Text style={[styles.font18, styles.fontSofiaSemiBold]}>{user.firstname}</Text>
                        <Text style={[styles.font18, styles.textMediumGray, styles.fontSofiaRegular]}>{user.lastname}</Text>
                    </View>
                    <View style={[componentStyle.singleInfo, componentStyle.borderBottom]}>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaSemiBold]}>Email</Text>
                        <Text style={[styles.font18, styles.textMediumGray, styles.fontSofiaRegular]}>{user.email}</Text>
                    </View>
                    <View style={[componentStyle.singleInfo, componentStyle.borderBottom]}>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaSemiBold]}>Mot de passe</Text>
                        <Image source={require("../../assets/images/croix.png")} style={{width: 25, height: 25, marginRight: 40}}/>
                    </View>
                    <View style={[componentStyle.singleInfo, componentStyle.borderBottom]}>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaSemiBold]}>Abonnement</Text>
                        <Text style={[styles.font18, styles.textMediumGray, styles.fontSofiaRegular, { textTransform: "capitalize" }]}>{`Membre ${user.subscription}`}</Text>
                    </View>
                </View>
                <View style={componentStyle.notice}>
                    <Image source={require("../../assets/images/profil-user.png")} style={{ width: 30, height: 30 }} />
                    <Text style={[styles.textCenter, styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { paddingVertical: 15 }]}>Pour modifier vos informations,</Text>
                    <View style={{ display: "flex", flexDirection: "row" }}>
                        <Text style={[styles.textCenter, styles.textDarkBlue, styles.font17, styles.fontSofiaRegular]}>rendez-vous sur </Text>
                        <TouchableOpacity style={{ paddingBottom: 15 }} onPress={() => Linking.openURL("https://thesecondelife.io")}>
                            <Text style={[styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { textDecorationLine: "underline" }]}>thesecondelife.io</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={signOut}>
                    <LinearGradient style={componentStyle.buttonDeconnecte} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                        <Text style={[styles.fontSofiaMedium, styles.font20, styles.textCenter]}>Déconnexion</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const componentStyle = StyleSheet.create({
    logoContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15
    },
    borderBottom: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: colors.gray
    },
    singleInfo: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
    },
    notice: {
        marginHorizontal: 20,
        marginVertical: 25,
        paddingVertical: 25,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonDeconnecte: {
        borderRadius: 25,
        width: "60%",
        paddingVertical: 15,
        marginLeft: "20%"
    }
});

export default MyAccount;
