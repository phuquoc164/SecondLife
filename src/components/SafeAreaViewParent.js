import React from "react";
import { hasNotch } from "react-native-device-info";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "../assets/css/styles";

const SafeAreaViewParent = (props) => {
    const insets = useSafeAreaInsets();
    let style = {
        ...styles.mainScreen,
        paddingBottom: hasNotch() ? insets.bottom + 16 : 85
    };
    if (props.style) {
        style = {
            ...style,
            ...props.style
        };
    }
    return (
        <SafeAreaView edges={["bottom"]} style={style}>
            {props.children}
        </SafeAreaView>
    );
};

export default SafeAreaViewParent;
