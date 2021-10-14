/** React */
import React from "react";
import { TouchableOpacity, Text, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/** App */
import styles from "../assets/css/styles";

const CustomButton = (props) => (
    <TouchableOpacity onPress={props.onPress} style={[{ width: "100%", paddingBottom: 10, paddingTop: Platform.OS === "ios" ? 15 : 10, borderRadius: 6 }, props.btnContainerStyle]}>
        {props.isLinear ? (
            <LinearGradient
                style={{ borderRadius: 5, paddingBottom: 10, paddingTop: Platform.OS === "ios" ? 15 : 10}}
                colors={["#FFFFFF", "#3EE48A"]}
                useAngle={true}
                angle={88}>
                <Text style={[styles.textWhite, styles.fontSofiaRegular, styles.textCenter, props.titleStyle]}>{props.title}</Text>
            </LinearGradient>
        ) : (
            <Text style={[styles.textWhite, styles.fontSofiaRegular, styles.textCenter, props.titleStyle]}>{props.title}</Text>
        )}
    </TouchableOpacity>
);

export default CustomButton;
