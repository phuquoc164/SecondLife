/** React */
import React from "react";
import { Image, View } from "react-native";

/** App */
import styles from "../assets/css/styles";

const SLSplashScreen = () => (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <View style={styles.greenScreen}>
            <Image source={require("../assets/images/Bounds.png")} style={styles.boundImage} />
        </View>
        <Image source={require("../assets/images/thunder-lighting.png")} style={styles.thunderImage} />
    </View>
);

export default SLSplashScreen;