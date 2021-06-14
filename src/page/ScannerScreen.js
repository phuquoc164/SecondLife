/** React */
import React, { useState } from "react";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { ActivityIndicator, Alert, Dimensions, Platform, View } from "react-native";

/** App */
import { colors } from "../lib/colors";
import FetchService from "../lib/FetchService";
import { AuthContext } from "../lib/AuthContext";
import { loadingScreen } from "../lib/Helpers";

const ScannerScreen = (props) => {
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const { user, signOut } = React.useContext(AuthContext);
    const scannerRef = React.useRef(null);

    React.useEffect(() => {
        if (scannerRef.current) {
            scannerRef.current.reactivate();
        }
    }, [props.route.params]);

    const handleReadQRCode = (event) => {
        const data = JSON.parse(event.data);
        if (data.type && data.type === "product") {
            setIsLoadingScreen(true);
            FetchService.get("/products/?reference=" + data.reference, user.token)
                .then((result) => {
                    const product = result["hydra:member"][0];
                    const status = product.currentStatus.status;
                    let catalogScreen = "";
                    if (status === "sell") {
                        catalogScreen = "Rayon";
                    } else if (status === "partner") {
                        catalogScreen = "OnceAgain";
                    } else {
                        catalogScreen = "Donation";
                    }
                    props.navigation.navigate("Catalog", {
                        screen: catalogScreen,
                        params: { reference: data.reference, deleteProduct: null, sellProduct: null }
                    });
                })
                .catch((error) => {
                    if (error === 401) {
                        Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: signOut }]);
                    } else {
                        console.error(error);
                        Alert.alert("Erreur", "On ne peut pas trouver le produit avec votre qr code");
                    }
                })
                .finally(() => {
                    setIsLoadingScreen(false);
                });
        } else if (data.type && data.type === "voucher") {
            props.navigation.navigate("Voucher", {
                screen: "ActifVouchers",
                params: { reference: data.reference, customer: null, available: null, usedOrExpired: null, fromBottomMenu: null }
            });
        } else {
            Alert.alert("Erreur", "On ne peut pas détecter votre qrcode");
        }
    };

    const renderCamera = () => {
        const isFocused = props.navigation.isFocused();

        if (!isFocused) {
            return null;
        } else if (isFocused) {
            return (
                <QRCodeScanner
                    ref={(node) => (scannerRef.current = node)}
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
            );
        }
    };

    return (
        <View style={{ height: "100%", backgroundColor: "rgba(238, 247, 255, 0.6)" }}>
            {renderCamera()}
            <ActivityIndicator color={colors.black} size="large" style={{ position: "absolute", top: 0, left: 0, bottom: 80, right: 0, zIndex: -1 }} />
            {loadingScreen(isLoadingScreen)}
        </View>
    );
};

export default ScannerScreen;
