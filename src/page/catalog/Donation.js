/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Alert, ScrollView, Platform } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { SHIPMENT_STATUS } from "../../lib/constants";
import FetchService from "../../lib/FetchService";
import { convertDateToDisplay, InputSearch, loading, loadingScreen } from "../../lib/Helpers";

// paddingTop of text in single product
const paddingTop = Platform.OS === "ios" ? 5 : 0;

// tab give => list Products
// tab gave => list shipments
const Donation = (props) => {
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tabActive, setTabActive] = useState("give");
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
        setDataDetail(null);
        getData();
    }, [tabActive]);

    React.useEffect(() => {
        if (props.route.params) {
            const { deleteProduct, reference } = props.route.params;
            if (deleteProduct && dataDetailed) {
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
            } else if (reference) {
                if (data.length > 0 && tabActive === "give") {
                    const newData = data.filter((product) => product.reference === reference);
                    setFilter({
                        keyword: reference,
                        listOptions: newData
                    });
                    props.navigation.setParams({ reference: null });
                } else if (tabActive === "gave") {
                    setTabActive("give");
                }
            }
        }
    }, [props.route.params]);

    React.useEffect(() => {
        const willFocusSubscription = props.navigation.addListener("focus", () => {
            setIsLoading(true);
            setDataDetail(null);
            getData();
        });

        return willFocusSubscription;
    }, []);

    // get product or get shipments
    const getData = (reference) => {
        const endpoint = tabActive === "give" ? "/products?isSentToDonation=0" : "/shipments?type=donation";
        FetchService.get(endpoint, user.token)
            .then((result) => {
                if (!!result) {
                    setData(result["hydra:member"]);
                    if (reference) {
                        const newData = result["hydra:member"].filter((product) => product.reference === reference);
                        setFilter({
                            keyword: reference,
                            listOptions: newData
                        });
                        props.navigation.setParams({ reference: null });
                    } else {
                        setFilter({
                            keyword: "",
                            listOptions: result["hydra:member"]
                        });
                    }
                    setIsLoading(false);
                    isLoadingScreen && setIsLoadingScreen(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * Render List products
     * @param {*} param0
     * @returns
     */
    const renderListProducts = ({ item, index }) => (
        <View key={item["@id"]} style={[styles.singleProduct, index === filter.listOptions.length - 1 && { marginBottom: 30 }]}>
            <TouchableOpacity onPress={() => handleDisplayProductDetail(item)}>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue, { paddingTop }]}>{item.title}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>{item.brand.name}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop: Platform.OS === "ios" ? 2 : 0 }]}>{`${
                    item.seller.name
                } - ${convertDateToDisplay(item.createAt)}`}</Text>
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

    const renderShipments = ({ item, index }) => (
        <View
            key={item["@id"]}
            style={[styles.singleProduct, { alignItems: "flex-start" }, index === filter.listOptions.length - 1 && { marginBottom: Platform.OS === "ios" ? 120 : 30 }]}>
            <View>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue, { paddingTop }]}>Envoi n°{item.poolNumber}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Date d'envoi: {convertDateToDisplay(item.sentAt)}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Statut: {SHIPMENT_STATUS[item.status]}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Nombre d'articles: {item.totalProducts}</Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    props.navigation.setOptions({
                        handleGoBack: () => setDataDetail(null)
                    });
                    setDataDetail(item);
                }}>
                <Text style={[styles.font14, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Voir le détail</Text>
            </TouchableOpacity>
        </View>
    );

    const renderShipmentsDetailed = () => {
        return (
            <ScrollView key={dataDetailed["@id"]}>
                <View style={[styles.singleProduct, { flexDirection: "column", alignItems: "flex-start", marginBottom: 60 }]}>
                    <View>
                        <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>Envoi n°{dataDetailed.poolNumber}</Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>
                            Date d'envoi: {convertDateToDisplay(dataDetailed.sentAt)}
                        </Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Statut: {SHIPMENT_STATUS[dataDetailed.status]}</Text>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Nombre d'articles: {dataDetailed.totalProducts}</Text>
                    </View>
                    <View style={[styles.divisionHorizontal, { backgroundColor: colors.gray, marginVertical: 10 }]} />
                    {dataDetailed.products && dataDetailed.products.map((productShipment, index) => {
                        const { product } = productShipment;
                        return (
                            <View key={product["@id"]} style={{ flexDirection: "row", marginTop: Platform.OS === "ios" && index !== 0 ? 10 : 0 }}>
                                <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, { marginRight: 10 }]}>{index + 1}.</Text>
                                <View>
                                    <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{product.title}</Text>
                                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>Ref: {product.reference}</Text>
                                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray, { paddingTop }]}>
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

    /**
     * handle filter list data by the input filter
     * @param {*} filter
     */
    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        if (tabActive === "give") {
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
                const { totalProducts, poolNumber } = shipment;

                return totalProducts.toString().includes(filterToLower) || poolNumber.toString().includes(filterToLower);
            });

            setFilter({
                keyword: filter,
                listOptions: newFilterShipments
            });
        }
    };

    /**
     * handle send request to send products to donation
     */
    const handleSendProducts = () => {
        setIsLoadingScreen(true);
        const productsShipment = listProductsSelected.ids.map((id) => {
            return { product: id };
        });

        const dataApi = { products: [...productsShipment], type: "donation" };
        FetchService.post("/shipments", dataApi, user.token)
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
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * handle display product detail
     * @param {*} item
     */
    const handleDisplayProductDetail = (item) => {
        setDataDetail(item);
        props.navigation.navigate("Catalog", {
            screen: "ProductDetail",
            params: {
                productId: item["@id"],
                screen: "Donation"
            }
        });
    };
    const nbProductsSelected = listProductsSelected.ids.length;
    const placeHolderFilter = tabActive === "give" ? "Chercher une commande..." : "Chercher un n° de suivi...";

    /**
     * render dashboard
     */
    const renderDashboard = () => (
        <>
            <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Préparation des dons en cours</Text>
                <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16, {paddingTop}]}>{nbProductsSelected} produits sélectionnés</Text>
                <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, styles.textCenter, { marginBottom: 10, paddingTop }]}>{nbProductsSelected}</Text>
                <View style={{ alignSelf: "center", marginBottom: 10 }}>
                    <TouchableOpacity disabled={nbProductsSelected === 0} onPress={handleSendProducts} style={[styles.btnSend, nbProductsSelected === 0 && { opacity: 0.5 }]}>
                        <Image source={require("../../assets/images/don.png")} style={styles.imageBtnSend} />
                        <Text style={[styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { top: -0.5, paddingRight: 10, paddingLeft: 5 }]}>Marquer comme donné</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {data.length !== 0 && (
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
            )}
        </>
    );

    return (
        <View style={[styles.mainScreen, { paddingBottom: 110 }]}>
            <View style={styles.menuNavigationContainer}>
                <View style={styles.flex1}>
                    <TouchableOpacity
                        disabled={tabActive === "give"}
                        onPress={() => {
                            setIsLoading(true);
                            setTabActive("give");
                        }}
                        style={{ alignSelf: "center" }}>
                        <View style={{ borderBottomWidth: tabActive === "give" ? 1 : 0, borderBottomColor: colors.darkBlue }}>
                            <Text style={[styles.menuNavigationLabel, { color: tabActive === "give" ? colors.darkBlue : colors.mediumGray }]}>À donner</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                    <TouchableOpacity
                        disabled={tabActive === "gave"}
                        onPress={() => {
                            setIsLoading(true);
                            setTabActive("gave");
                        }}
                        style={{ alignSelf: "center" }}>
                        <View style={{ borderBottomWidth: tabActive === "gave" ? 1 : 0, borderBottomColor: colors.darkBlue }}>
                            <Text style={[styles.menuNavigationLabel, { color: tabActive === "gave" ? colors.darkBlue : colors.mediumGray }]}>Donnés</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            {!dataDetailed && <InputSearch placeholder={placeHolderFilter} placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />}

            {isLoading && loading()}

            {!isLoading && filter.listOptions.length > 0 ? (
                tabActive === "give" ? (
                    <SafeAreaView style={{ marginBottom: 90 }}>
                        <FlatList data={filter.listOptions} renderItem={renderListProducts} keyExtractor={(item) => item["@id"]} ListHeaderComponent={renderDashboard} />
                    </SafeAreaView>
                ) : (
                    <SafeAreaView style={{ marginBottom: dataDetailed ? 0 : 90 }}>
                        {dataDetailed ? renderShipmentsDetailed() : <FlatList data={filter.listOptions} renderItem={renderShipments} keyExtractor={(item) => item["@id"]} />}
                    </SafeAreaView>
                )
            ) : (
                <Text style={[styles.textCenter, styles.textDarkBlue, styles.font20, styles.fontSofiaMedium, { paddingVertical: 10 }]}>Il n'y a aucun produit</Text>
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

export default Donation;
