/** React */
import React from "react";
import { View } from "react-native";

/** App */
import CustomButton from "./CustomButton";
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";

const MenuHelper = (props) => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "90%" }}>
            <CustomButton
                btnContainerStyle={{ borderColor: colors.white, borderWidth: 1, paddingVertical: 0, marginBottom: 5 }}
                title="Compte"
                isLinear={true}
                titleStyle={[styles.font24]}
                onPress={() => props.navigation.navigate("Profil", { screen: "MyAccount" })}
            />
            <CustomButton
                btnContainerStyle={{ borderColor: colors.white, borderWidth: 1, paddingVertical: 0 }}
                title="Aide"
                isLinear={true}
                titleStyle={[styles.font24]}
                onPress={() => props.navigation.navigate("Help")}
            />
            <CustomButton
                btnContainerStyle={{ backgroundColor: colors.white, marginTop: 20 }}
                title="Annuler"
                isLinear={false}
                titleStyle={[styles.font24, styles.textGreen]}
                onPress={props.navigation.goBack}
            />
        </View>
    </View>
);

export default MenuHelper;
