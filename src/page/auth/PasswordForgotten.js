/** React */
import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Linking } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/** App */
import styles from "../../assets/css/styles";

const PasswordForgotten = (props) => {
    const {navigation, route} = props;
    console.log()
    return (
        <View style={[styles.positionRelative, stylesComponent.mainContainer]}>
            <TouchableOpacity onPress={navigation.goBack} style={{ position: "absolute", top: 20, left: 20 }}>
                <Image source={require("../../assets/images/arrow-right.png")} style={{ width: 35, height: 21 }} />
            </TouchableOpacity>
            <View style={[stylesComponent.logoContainer, styles.positionAbsolute]}>
                <Image source={require("../../assets/images/The-Second-Life-NOIR.png")} style={[styles.bigLogo]} />
            </View>
            <View style={{ display: "flex", alignItems: "center" }}>
                <Text style={[styles.fontSofiaRegular, styles.textCenter, stylesComponent.text]}>{route.params.title}</Text>
                <Image source={require("../../assets/images/arrow-down.png")} style={{ width: 30, height: 49 }} />
                <TouchableOpacity onPress={() => Linking.openURL("https://thesecondelife.com")}>
                    <LinearGradient style={stylesComponent.button} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                        <Text style={[styles.fontSofiaMedium, stylesComponent.buttonText]}>Thesecondelife.com</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const stylesComponent = StyleSheet.create({
    mainContainer: {
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
