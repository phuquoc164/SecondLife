/** React */
import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Linking, Platform } from "react-native";
import { hasNotch } from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

/** App */
import styles from "../../assets/css/styles";
import { colors } from "../../lib/colors";

const PasswordForgotten = (props) => {
    const { navigation, route } = props;
    return (
        <SafeAreaView edges={["top"]} style={[styles.positionRelative, stylesComponent.mainContainer]}>
            <TouchableOpacity onPress={navigation.goBack} style={{ position: "absolute", top: Platform.OS === "ios" && hasNotch() ? 40 : 20, left: 20 }}>
                <Image source={require("../../assets/images/arrow-right.png")} style={{ width: 35, height: 21 }} />
            </TouchableOpacity>
            <View style={[stylesComponent.logoContainer, styles.positionAbsolute]}>
                <Image source={require("../../assets/images/The-Second-Life-NOIR.png")} style={[styles.bigLogo]} />
            </View>
            <View style={{ display: "flex", alignItems: "center" }}>
                <Text style={[styles.fontSofiaRegular, styles.textCenter, stylesComponent.text]}>{route.params.title}</Text>
                <Image source={require("../../assets/images/arrow-down.png")} style={{ width: 30, height: 49 }} />
                <TouchableOpacity onPress={() => Linking.openURL("https://thesecondlife.io")}>
                    <LinearGradient style={stylesComponent.button} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                        <Text style={[styles.fontSofiaMedium, stylesComponent.buttonText]}>thesecondlife.io</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const stylesComponent = StyleSheet.create({
    mainContainer: {
        backgroundColor: colors.white,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        paddingHorizontal: 40
    },
    logoContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        top: Dimensions.get("window").height / 7,
        left: 40,
        right: 40
    },
    text: {
        fontSize: 18,
        marginBottom: 15
    },
    button: {
        borderRadius: 60,
        width: Dimensions.get("window").width - 40,
        paddingVertical: 15,
        marginVertical: 15
    },
    buttonText: {
        fontSize: 18,
        textAlign: "center",
        color: "#171717"
    }
});

export default PasswordForgotten;
