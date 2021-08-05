/** React */
import React from "react";
import { View, Dimensions, Image, TouchableOpacity } from "react-native";
import { hasNotch } from 'react-native-device-info';
import { SafeAreaView } from "react-native-safe-area-context";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";

const HomeScreen = (props) => {
    const imageWidth = (Dimensions.get("window").width / 100) * 50;
    
    let heightMainContainer = Dimensions.get("window").height - 90.3 - 130
    heightMainContainer = hasNotch() ? heightMainContainer - 80 : heightMainContainer - 60;
    const marginTopOfLogo = hasNotch() ? 10 : 30;
    
    return (
        <SafeAreaView edges={["top", "bottom"]} style={{ backgroundColor: colors.green, flex: 1 }}>
            <View style={[styles.greenScreen, { height: "100%", alignItems: "center" }]}>
                <Image source={require("../assets/images/The-Second-Life-NOIR.png")} style={{ width: 176.4, height: 90.3, marginBottom: 30, marginTop: marginTopOfLogo }} />
                <View
                    style={{
                        flexDirection: "row",
                        width: Dimensions.get("window").width,
                        height: heightMainContainer
                    }}>
                    <View>
                        <TouchableOpacity onPress={() => props.navigation.navigate("NewProduct", { screen: "NewCustomer" })}>
                            <Image source={require("../assets/images/new-lifer.png")} style={{ width: imageWidth, height: (imageWidth * 974) / 548 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                        <TouchableOpacity onPress={() => props.navigation.navigate("NewProduct", { screen: "ListCustomersAddProduct", params: { addProduct: true } })}>
                            <Image source={require("../assets/images/lifer.png")} style={{ width: imageWidth, height: (imageWidth * 987) / 555 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(HomeScreen);
