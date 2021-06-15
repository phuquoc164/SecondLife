/** React */
import React from "react";
import { View, Dimensions, Image, TouchableOpacity } from "react-native";

/** App */
import styles from "../assets/css/styles";

const HomeScreen = (props) => {
    const imageWidth = (Dimensions.get("window").width / 100) * 50;

    return (
        <View style={[styles.greenScreen, { height: "100%", alignItems: "center" }]}>
            <Image source={require("../assets/images/The-Second-Life-NOIR.png")} style={{ width: 176.4, height: 90.3, marginVertical: 30 }} />
            <View
                style={{
                    flexDirection: "row",
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height - 90.3 - 60 - 130
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
    );
};

export default React.memo(HomeScreen);
