/** React */
import React from "react";
import { View, Image, Text } from "react-native";

import { colors } from '../../lib/colors';

const NeedHelp = (props) => {
    return (
        <View style={{ backgroundColor: "#EEF7FF", height: "100%" }}>
            <Image source={require("../../assets/images/The-Second-Life-NOIR.png")} style={{ width: 200, height: 102.4, marginVertical: 30 }} />
            <View style={{ backgroundColor: colors.white, borderRadius: 20 }}>
                <Text>Besoin d'aide</Text>
                <Text>Rendez-vous sur</Text>
                <CustomButton
                    btnContainerStyle={{ borderColor: colors.white, borderWidth: 1, paddingVertical: 0, marginBottom: 5 }}
                    title="thesecondlife.io"
                    isLinear={true}
                    titleStyle={[styles.font24]}
                    onPress={() => Linking.openURL("https://thesecondlife.io")}
                />
            </View>
        </View>
    );
}

export default NeedHelp;