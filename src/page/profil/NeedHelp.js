/** React */
import React from "react";
import { View, Image, Text, TouchableOpacity, Linking } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/** App */
import styles from "../../assets/css/styles";
import { colors } from "../../lib/colors";

const NeedHelp = (props) => (
    <View style={{ backgroundColor: "#EEF7FF", height: "100%", alignItems: "center", paddingHorizontal: 20 }}>
        <Image source={require("../../assets/images/The-Second-Life-NOIR.png")} style={{ width: 200, height: 102.4, marginBottom: 40, marginTop: 60 }} />
        <View style={{ backgroundColor: colors.white, borderRadius: 35, width: "100%", paddingVertical: 40, position: "relative" }}>
            <Text style={[styles.fontSofiaSemiBold, styles.textCenter, styles.textDarkBlue, { fontSize: 30, letterSpacing: 2 }]}>Besoin d'aide</Text>
            <Text style={[styles.font20, styles.fontSofiaRegular, styles.textCenter, styles.textDarkBlue, { marginVertical: 40 }]}>Rendez-vous sur</Text>
            <View style={{ width: 280, alignSelf: "center", paddingBottom: 140 }}>
                <TouchableOpacity onPress={() => Linking.openURL("https://thesecondlife.io")}>
                    <LinearGradient style={{ borderRadius: 30, paddingVertical: 15 }} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                        <Text style={[styles.fontSofiaSemiBold, styles.font24, styles.textDarkBlue, styles.textCenter, { letterSpacing: 1 }]}>thesecondlife.io</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <Image source={require("../../assets/images/need-help.png")} style={{ width: 300, height: 191.1, position: "absolute", right: 0, bottom: "-15%" }} />
        </View>
    </View>
);

export default NeedHelp;
