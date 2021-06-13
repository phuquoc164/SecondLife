/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Alert, ScrollView } from "react-native";
import ProgressCircle from "react-native-progress-circle";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { SHIPMENT_STATUS } from "../../lib/constants";
import FetchService from "../../lib/FetchService";
import { convertDateToDisplay, InputSearch, loading, loadingScreen } from "../../lib/Helpers";

// if tabActive === "products" => data is listProducts
// if tabActive === "shipment" => data is shipment
const OnceAgain = (props) => {
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [tabActive, setTabActive] = useState("products");
    const [data, setData] = useState([]);
    const [listProductsSelected, setListProductsSelected] = useState({
        allInfo: [],
        ids: []
    });
    const [filter, setFilter] = useState({
        keyword: "",
        listOptions: []
    });
    const [dataDetailed, setDataDetail] = useState(null);

    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        !isLoading && setIsLoading(true);
        setDataDetail(null);
        getData();
    }, [tabActive]);

    // Delete produit from product detail
    React.useEffect(() => {
        if (props.route.params.deleteProduct && dataDetailed) {
            setIsLoadingScreen(true);
            //TODO: erreeur unexpected end of json input
            FetchService.delete(dataDetailed["@id"], user.token)
                .then((result) => {
                    if (result) {
                        const newData = data.filter((product) => product["@id"] !== dataDetailed["@id"]);
                        setData(newData);
                        setFilter({
                            keyword: "",
                            listOptions: newData
                        });
                        if (listProductsSelected.ids.includes(dataDetailed["@id"])) {
                            const newAllInfo = listProductsSelected.allInfo.filter((product) => product["@id"] !== dataDetailed["@id"]);
                            const newIds = listProductsSelected.ids.filter((id) => id !== dataDetailed["@id"]);
                            setListProductsSelected({ allInfo: newAllInfo, ids: newIds });
                        }
                        setDataDetail(null);
                        setIsLoadingScreen(false);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    Alert.alert("Erreur", "Delete product fail");
                });
        }
    }, [props.route.params]);

    // get product or get shipments
    const getData = () => {
        const endpoint = tabActive === "products" ? "/products?isSentToPartner=0" : "/shipments";
        FetchService.get(endpoint, user.token)
            .then((result) => {
                if (!!result && result["@id"] === `/${tabActive}`) {
                    setData(result["hydra:member"]);
                    setFilter({
                        keyword: "",
                        listOptions: result["hydra:member"]
                    });
                    isLoading && setIsLoading(false);
                    isLoadingScreen && setIsLoadingScreen(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Error", "Can't get data");
            });
    };

    /**
     * Render List products
     * @param {*} param0
     * @returns
     */
    const renderListProducts = ({ item }) => (
        <View key={item["@id"]} style={styles.singleProduct}>
            <TouchableOpacity onPress={() => handleDisplayProductDetail(item)}>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.title}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{item.brand.name}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{`${item.seller.name} - ${convertDateToDisplay(item.createAt)}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSelectProduct(item)}>
                {listProductsSelected.ids.includes(item["@id"]) ? (
                    <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                ) : (
                    <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                )}
            </TouchableOpacity>
        </View>
    );

    const renderShipments = ({ item }) => (
        <View key={item["@id"]} style={[styles.singleProduct, { alignItems: "flex-start" }]}>
            <View>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>Envoi n°{item.poolNumber}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Date d'envoi: xxx</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Statut: {SHIPMENT_STATUS[item.status]}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Nombre d'articles: {item.totalProducts}</Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    props.navigation.setOptions({
                        handleGoBack: () => setDataDetail(null)
                    });
                    setDataDetail(item);
                }}>
                <Text style={[styles.font14, styles.fontSofiaRegular, styles.textMediumGray]}>Voir le détail</Text>
            </TouchableOpacity>
        </View>
    );

    const renderShipmentsDetailed = () => {
        return (
            <ScrollView key={dataDetailed["@id"]}>
                <View style={[styles.singleProduct, { flexDirection: "column", alignItems: "flex-start" }]}>
                    <View>
                        <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>Envoi n°{dataDetailed.poolNumber}</Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Date d'envoi: {convertDateToDisplay(dataDetailed.sentAt)}</Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Statut: {SHIPMENT_STATUS[dataDetailed.status]}</Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Nombre d'articles: {dataDetailed.totalProducts}</Text>
                    </View>
                    <View style={[styles.divisionHorizontal, { backgroundColor: colors.gray, marginVertical: 10 }]} />
                    {dataDetailed.products.map((productShipment, index) => {
                        const { product } = productShipment;
                        return (
                            <View key={product["@id"]} style={{ flexDirection: "row" }}>
                                <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, { marginRight: 10 }]}>{index + 1}.</Text>
                                <View>
                                    <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{product.title}</Text>
                                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{product.reference}</Text>
                                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>Price: {product.price}€</Text>
                                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>
                                        Customer: {product.customer.firstname} {product.customer.lastname}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        );
    };

    /**
     * Handle select or unselect all products
     */
    const handleSelectAllProducts = () => {
        if (listProductsSelected.allInfo.length === data.length) {
            setListProductsSelected({
                allInfo: [],
                ids: []
            });
        } else {
            const ids = data.map((product) => product["@id"]);
            setListProductsSelected({
                allInfo: data,
                ids
            });
        }
    };

    /** Handle select or unselect one product */
    const handleSelectProduct = (item) => {
        if (listProductsSelected.ids.includes(item["@id"])) {
            const listNewProducts = listProductsSelected.allInfo.filter((product) => product["@id"] !== item["@id"]);
            const listNewIds = listProductsSelected.ids.filter((id) => id !== item["@id"]);
            setListProductsSelected({
                allInfo: listNewProducts,
                ids: listNewIds
            });
        } else {
            setListProductsSelected({
                allInfo: [...listProductsSelected.allInfo, item],
                ids: [...listProductsSelected.ids, item["@id"]]
            });
        }
    };

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        if (tabActive === "products") {
            const newFilterProducts = data.filter((product) => {
                const { title, brand, seller, createAt, reference } = product;
                const date = convertDateToDisplay(createAt);
                return (
                    title.toLowerCase().includes(filterToLower) ||
                    brand.name.toLowerCase().includes(filterToLower) ||
                    seller.name.toLowerCase().includes(filterToLower) ||
                    date.includes(filterToLower) ||
                    reference.toLowerCase().includes(filterToLower)
                );
            });

            setFilter({
                keyword: filter,
                listOptions: newFilterProducts
            });
        } else {
            const newFilterShipments = data.filter((shipment) => {
                const { status, totalProducts, poolNumber } = shipment;

                return (
                    SHIPMENT_STATUS[status].toLowerCase().includes(filterToLower) ||
                    totalProducts.toString().includes(filterToLower) ||
                    poolNumber.toString().includes(filterToLower)
                );
            });

            setFilter({
                keyword: filter,
                listOptions: newFilterShipments
            });
        }
    };

    const handleSendProducts = () => {
        setIsLoadingScreen(true);
        const productsShipment = listProductsSelected.ids.map((id) => {
            return { product: id };
        });

        const data = { products: [...productsShipment] };
        FetchService.post("/shipment", data, user.token)
            .then((result) => {
                if (result && result["@id"]) {
                    const newData = data.filter((product) => !listProductsSelected.ids.includes(product["@id"]));
                    setData(newData);
                    setFilter({
                        keyword: "",
                        listOptions: newData
                    });
                    setListProductsSelected({ allInfo: [], ids: [] });
                    setIsLoadingScreen(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Shipment erreur");
            });
    };

    const handleDisplayProductDetail = (item) => {
        setDataDetail(item);
        props.navigation.navigate("Catalog", {
            screen: "ProductDetail",
            params: {
                productId: item["@id"],
                screen: "OnceAgain"
            }
        });
    };

    const nbProductsSelected = listProductsSelected.ids.length;
    const percent = nbProductsSelected >= 15 ? 100 : (nbProductsSelected / 15) * 100;
    const placeHolderFilter = tabActive === "products" ? "Chercher une commande..." : "Chercher un n° de suivi...";

    return (
        <View style={[styles.mainScreen, { paddingBottom: 150 }]}>
            <View style={styles.menuNavigationContainer}>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("products")} style={{ alignSelf: "center" }}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "products" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>À envoyer</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("shipments")}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "shipments" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>Envoyés</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {!dataDetailed && <InputSearch placeholder={placeHolderFilter} placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />}

            {isLoading && loading()}
            {/* TODO: find the way for scroll view  */}
            {!isLoading && tabActive === "products" && (
                <>
                    <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Préparation de l'envoi en cours</Text>
                        <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16]}>{15 - nbProductsSelected} produits à sélectionner</Text>
                        <View style={{ alignItems: "center", paddingVertical: 15 }}>
                            <ProgressCircle
                                percent={percent}
                                radius={55}
                                borderWidth={3}
                                color={percent >= 100 ? colors.green : colors.red}
                                shadowColor={colors.gray}
                                bgColor={colors.white}
                                outerCircleStyle={{
                                    transform: [{ rotate: "-45deg" }]
                                }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        transform: [{ rotate: "45deg" }],
                                        position: "relative"
                                    }}>
                                    <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, { top: -5 }]}>
                                        {nbProductsSelected}
                                        <Text style={[styles.textGreen, styles.fontSofiaRegular, styles.positionAbsolute, styles.font18, { bottom: 18 }]}>/15</Text>
                                    </Text>
                                </View>
                            </ProgressCircle>
                        </View>
                        <View style={{ alignSelf: "center", marginBottom: 10 }}>
                            <TouchableOpacity disabled={percent < 100} onPress={handleSendProducts} style={[styles.btnSend, percent < 100 && { opacity: 0.5 }]}>
                                <Image source={require("../../assets/images/flight-btn.png")} style={styles.imageBtnSend} />
                                <Text style={[styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { top: -0.5, paddingRight: 10, paddingLeft: 5 }]}>
                                    Marquer comme envoyé
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ alignSelf: "flex-end", margin: 20, paddingRight: 20, flexDirection: "row", alignItems: "center" }}>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textDarkBlue, { letterSpacing: 2, paddingRight: 10 }]}>Tout sélectionner</Text>
                        <TouchableOpacity onPress={handleSelectAllProducts}>
                            {data.length === listProductsSelected.allInfo.length ? (
                                <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                            ) : (
                                <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView style={{ marginBottom: 450 }}>
                        <FlatList data={filter.listOptions} renderItem={renderListProducts} keyExtractor={(item) => item["@id"]} />
                    </SafeAreaView>
                </>
            )}

            {!isLoading && tabActive === "shipments" && (
                <SafeAreaView>
                    {dataDetailed ? renderShipmentsDetailed() : <FlatList data={filter.listOptions} renderItem={renderShipments} keyExtractor={(item) => item["@id"]} />}
                </SafeAreaView>
            )}
            {loadingScreen(isLoadingScreen)}
        </View>
    );
};

const componentStyle = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderColor: colors.mediumGray,
        borderRadius: 15,
        marginHorizontal: 20
    }
});

export default OnceAgain;
