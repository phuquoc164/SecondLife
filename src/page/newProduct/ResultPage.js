/** React */
import React from "react";
import { SafeAreaView, ScrollView, View, TouchableOpacity, Text, Image, TextInput, Alert } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";

const screenPageCatalog = {
    partner: "OnceAgain",
    sell: "Rayon",
    donation: "Donation"
}

const ResultPage = (props) => {
    const [product, setProduct] = React.useState({});
    const [showPageResult, setShowPageResult] = React.useState(props.route.params.typeCatalog !== "sell");

    const { user } = React.useContext(AuthContext);


    React.useEffect(() => {
        if (props.route.params.typeCatalog === "sell") {
            setProduct(props.route.params.data);
            setShowPageResult(false);
        } else {
            setShowPageResult(true);
        }
    }, [props.route.params]);

    const handleAddOtherProduct = () => {
        if (props.route.params.typeCatalog !== "sell") {
            props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { forceReset: true } });
        } else {
            product.price = parseInt(product.price.replace("€", ""));
            FetchService.post("/products", product, user.token)
                .then((result) => {
                    if (result && result["@id"]) {
                        props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { forceReset: true } });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    Alert.aler("Add Product sell error");
                });
        }
    };

    const handleFinish = () => {
        const { typeCatalog } = props.route.params;
        if (typeCatalog !== "sell") {
            props.navigation.navigate("Catalog", { screen: screenPageCatalog[typeCatalog] });
        } else {
            product.price = parseInt(product.price.replace("€", ""));
            FetchService.post("/products", product, user.token)
                .then((result) => {
                    if (result && result["@id"]) {
                        props.navigation.navigate("Catalog", { screen: "Rayon" });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    Alert.aler("Add Product sell error");
                });
        }
    }

    return (
        <SafeAreaView style={styles.mainScreen}>
            <ScrollView style={{ marginTop: 30 }}>
                {showPageResult && (
                    <>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font28, styles.textCenter]}>Félicitations !</Text>
                        <View style={{ alignSelf: "center", marginVertical: 20 }}>
                            <Image source={require("../../assets/images/oke.png")} style={{ width: 60, height: 60 }} />
                        </View>
                        <View
                            style={{
                                borderColor: colors.mediumGray,
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: 20,
                                marginBottom: 40,
                                marginHorizontal: 30,
                                paddingVertical: 40,
                                paddingHorizontal: 15
                            }}>
                            <Text style={[styles.textDarkBlue, styles.textCenter, styles.fontSofiaRegular, styles.font20, { lineHeight: 25 }]}>
                                {props.route.params.description}
                            </Text>
                        </View>
                    </>
                )}
                {!showPageResult && (
                    <>
                        {/* Refernce */}
                        <View style={[styles.addProductInputContainer, styles.positionRelative, { marginBottom: 10 }]}>
                            <Text style={styles.addProductLabel}>Référence</Text>
                            <TextInput
                                style={[styles.addProductInput, { marginRight: 40 }]}
                                placeholder="ex: 5341ezf845"
                                placeholderTextColor={colors.gray2}
                                value={product.reference}
                                onChangeText={(reference) => setProduct({ ...product, reference })}
                            />
                            <TouchableOpacity style={{ position: "absolute", top: "50%", right: 10, marginTop: -10 }}>
                                <Image source={require("../../assets/images/qrcode.png")} style={{ width: 40, height: 40.5 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Price */}
                        <View style={[styles.addProductInputContainer, { marginBottom: 10 }]}>
                            <Text style={styles.addProductLabel}>Prix de vente boutique</Text>
                            <TextInput
                                style={[styles.addProductInput]}
                                placeholder="0,00€"
                                placeholderTextColor={colors.gray2}
                                value={`${product.price}`}
                                onFocus={() => {
                                    if (product.price) {
                                        const newValue = product.price.replace("€", "");
                                        setProduct({ ...product, price: newValue });
                                    }
                                }}
                                onBlur={() => {
                                    if (product.price) {
                                        const newValue = (product.price + "€").replace(",", ".");
                                        setProduct({ ...product, price: newValue });
                                    }
                                }}
                                keyboardType="decimal-pad"
                                onChangeText={(price) => setProduct({ ...product, price })}
                            />
                            {props.route.params.sellingPrice && (
                                <Text style={[styles.font14, styles.fontSofiaRegular, { color: colors.gray2 }]}>Montant conseillé: {props.route.params.sellingPrice}€</Text>
                            )}
                        </View>
                    </>
                )}
                <View style={{ marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={handleAddOtherProduct}
                        style={[styles.greenScreen, { marginHorizontal: 30, paddingVertical: 10, borderRadius: 10, marginVertical: 10 }]}>
                        <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>{"Ajouter un nouveau\nproduit"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleFinish}
                        style={{ borderRadius: 10, borderColor: colors.green, borderWidth: 3, marginHorizontal: 30, paddingVertical: 15, backgroundColor: colors.darkBlue }}>
                        <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>Terminer</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ResultPage;
