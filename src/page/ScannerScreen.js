/** React */
import React, { useState } from "react";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { Alert, Dimensions, Platform, View } from "react-native";

/** App */
import { colors } from "../lib/colors";
import FetchService from "../lib/FetchService";
import { AuthContext } from "../lib/AuthContext";
import { loadingScreen } from "../lib/Helpers";

const ScannerScreen = (props) => {
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const { user } = React.useContext(AuthContext);

    const handleReadQRCode = (event) => {
        const data = JSON.parse(event.data);
        if (data.type && data.type === "product") {
            FetchService.get("/products/" + data.reference, user.token)
                .then((result) => {})
                .catch((error) => {
                    console.error(error);
                });
            // TODO: comment savoir c'est quel status le product
        } else if (data.type && data.type === "voucher") {
            props.navigation.navigate("Voucher", {
                screen: "ActifVouchers",
                params: { reference: data.reference, customer: null, available: null, usedOrExpired: null }
            });
        } else {
            Alert.alert("Erreur", "On ne peut pas détecter votre qrcode");
        }
    };

    return (
        <View style={{ height: "100%", backgroundColor: "rgba(238, 247, 255, 0.6)" }}>
            <QRCodeScanner
                onRead={handleReadQRCode}
                flashMode={RNCamera.Constants.FlashMode.auto}
                showMarker={true}
                customMarker={
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            backgroundColor: "transparent"
                        }}>
                        <View
                            style={{
                                height: 250,
                                width: 250,
                                borderWidth: 2,
                                borderColor: colors.green,
                                backgroundColor: "transparent"
                            }}
                        />
                    </View>
                }
                topViewStyle={{ height: 0, flex: 0 }}
                bottomViewStyle={{ height: 0, flex: 0 }}
                cameraStyle={{
                    height: Platform.OS === "ios" ? Dimensions.get("screen").height - 150 : Dimensions.get("screen").height - 180
                }}
            />
            {loadingScreen(isLoadingScreen)}
        </View>
    );
};

export default ScannerScreen;
