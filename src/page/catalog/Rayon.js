/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { convertDateToDisplay, InputSearch, loading, loadingScreen } from "../../lib/Helpers";

const Rayon = (props) => {
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [tabActive, setTabActive] = useState("sell");
    const [listProducts, setListProducts] = useState([]);
    const [listProductsSelected, setListProductsSelected] = useState({
        allInfo: [],
        ids: []
    });
    const [filter, setFilter] = useState({
        keyword: "",
        listProducts: []
    });
    const [productDetail, setProductdetail] = useState(null);
    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        !isLoading && setIsLoading(true);
        setProductdetail(null);
        getListProducts();
    }, [tabActive]);

    React.useEffect(() => {
        if (dataDetailed) {
            setIsLoadingScreen(true);
            const { deleteProduct, sellProduct } = props.route.params;
            if (deleteProduct) {
                //TODO: erreeur unexpected end of json input
                FetchService.delete(productDetail["@id"], user.token).then((result) => {
                    if (result) {
                        const newData = data.filter((product) => product["@id"] !== productDetail["@id"]);
                        setData(newData);
                        setFilter({
                            keyword: "",
                            listOptions: newData
                        });
                        if (listProductsSelected.ids.includes(productDetail["@id"])) {
                            const newAllInfo = listProductsSelected.allInfo.filter((product) => product["@id"] !== productDetail["@id"]);
                            const newIds = listProductsSelected.ids.filter((id) => id !== productDetail["@id"]);
                            setListProductsSelected({ allInfo: newAllInfo, ids: newIds });
                        }
                        setProductdetail(null);
                        setIsLoadingScreen(false);
                    }
                }).catch(error => {
                    console.error(error);
                    Alert.alert("Erreur", "Delete product fail");
                });
            } else if (sellProduct) {
                // TODO: handle sell Product
            }
        }
        
    }, [props.route.params]);

    const getListProducts = () => {
        const endpoint = tabActive === "sell" ? "/products?isSell=0" : "/products?isSell=1";
        FetchService.get(endpoint, user.token)
            .then((result) => {
                if (!!result && result["@id"] === "/products") {
                    setListProducts(result["hydra:member"]);
                    setFilter({
                        keyword: "",
                        listProducts: result["hydra:member"]
                    });
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Error", "Can't get list products");
            });
    };

    /**
     * Render List products
     * @param {*} param0
     * @returns
     */
    const renderListProducts = ({ item }) => {
        const sellBy = tabActive === "sell" ? "" : "Vendu par ";

        return (
            <View key={item["@id"]} style={styles.singleProduct}>
                <TouchableOpacity
                    onPress={() => {
                        if (tabActive === "sell") {
                            handleDisplayProductDetail(item);
                        } else {
                            props.navigation.setOptions({
                                handleGoBack: () => setDataDetail(null)
                            });
                            setProductdetail(item);
                        }
                    }}>
                    <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.title}</Text>
                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{item.brand.name}</Text>
                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{`${sellBy}${item.seller.name} - ${convertDateToDisplay(item.createAt)}`}</Text>
                </TouchableOpacity>
                {tabActive === "sell" && (
                    <TouchableOpacity onPress={() => handleSelectProduct(item)}>
                        {listProductsSelected.ids.includes(item["@id"]) ? (
                            <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                        ) : (
                            <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderSoldProductDetail = () => {
        const voucher = productDetail.vouchers[0];
        let statusVoucher = "";
        if (voucher) {
            statusVoucher = voucher.used ? "Utilisé" : voucher.expired ? "Expiré" : "Valide";
        }
        return (
            <ScrollView>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Nom</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.title}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Marque</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.brand.name}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Catégorie</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.category.name}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Taille</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.size.size}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Etat</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.state.state}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Description</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.description}</Text>
                </View>
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Seller</Text>
                    <Text style={[styles.addProductInput, styles.textMediumGray]}>{productDetail.seller.name}</Text>
                </View>
                <View style={{ marginHorizontal: 20 }}>
                    <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Date de dépôt: {convertDateToDisplay(productDetail.createAt)}</Text>
                    {voucher && (
                        <View>
                            <Text style={[styles.font20, styles.textDarkBlue, styles.fontSofiaSemiBold, { marginVertical: 20 }]}>Valeur de bon d'achat</Text>
                            <View
                                style={{
                                    borderColor: "rgba(0, 0, 0, 0.22)",
                                    borderWidth: 1,
                                    borderRadius: 30,
                                    backgroundColor: colors.white,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    width: 140,
                                    alignSelf: "center",
                                    marginBottom: 20
                                }}>
                                <Text style={[styles.font24, styles.textDarkBlue, styles.fontSofiaSemiBold, styles.textCenter]}>{voucher.voucherAmount}€</Text>
                            </View>
                            <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Statut: {statusVoucher}</Text>
                            <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Date de validité: {convertDateToDisplay(voucher.expirationDate)}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={[styles.font20, styles.textDarkBlue, styles.fontSofiaSemiBold, { marginVertical: 20 }]}>Informations déposant</Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Prénom: {productDetail.customer.firstname}</Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Nom: {productDetail.customer.lastname}</Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Email: {productDetail.customer.email}</Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Tel: </Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    /**
     * Handle select or unselect all products
     */
    const handleSelectAllProducts = () => {
        if (listProductsSelected.allInfo.length === listProducts.length) {
            setListProductsSelected({
                allInfo: [],
                ids: []
            });
        } else {
            const ids = listProducts.map((product) => product["@id"]);
            setListProductsSelected({
                allInfo: listProducts,
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
        const newFilterProducts = listProducts.filter((product) => {
            const { title, brand, seller, createAt } = product;
            const date = convertDateToDisplay(createAt);
            return (
                title.toLowerCase().includes(filterToLower) ||
                brand.name.toLowerCase().includes(filterToLower) ||
                seller.name.toLowerCase().includes(filterToLower) ||
                date.includes(filterToLower)
            );
        });

        setFilter({
            keyword: filter,
            listOptions: newFilterProducts
        });
    };

    const handleDisplayProductDetail = (item) => {
        setProductdetail(item);
        props.navigation.navigate("Catalog", {
            screen: "ProductDetail",
            params: {
                productId: item["@id"],
                screen: "Rayon",
                btnText: "Marqué comme\nenvoyé"
            }
        });
    };

    // TODO: handle mettre comme envoyé
    const handleSellProducts = () => {
        setIsLoadingScreen(true);
        // const
    };

    const nbProductsSelected = listProductsSelected.ids.length;

    return (
        <View style={styles.mainScreen}>
            <View style={styles.menuNavigationContainer}>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("sell")} style={{ alignSelf: "center" }}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "sell" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>À vendre</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("sold")}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "sold" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>Vendu</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <InputSearch placeholder="Chercher une commande..." placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            {isLoading && loading()}

            {/* TODO: find the way to display well the list of produits */}
            {!isLoading && tabActive === "sell" && (
                <>
                    <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Produits en vente</Text>
                        <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16]}>{nbProductsSelected} produits sélectionnés</Text>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, styles.textCenter, { marginBottom: 10 }]}>{nbProductsSelected}</Text>
                        <View style={{ alignSelf: "center", marginBottom: 10 }}>
                            <TouchableOpacity
                                disabled={nbProductsSelected === 0}
                                onPress={handleSellProducts}
                                style={[styles.btnSend, nbProductsSelected === 0 && { opacity: 0.5 }]}>
                                <Image source={require("../../assets/images/rayon.png")} style={styles.imageBtnSend} />
                                <Text style={[styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { top: -0.5, paddingRight: 10, paddingLeft: 5 }]}>
                                    Marquer comme vendu
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ alignSelf: "flex-end", margin: 20, paddingRight: 20, flexDirection: "row", alignItems: "center" }}>
                        <Text style={[styles.font16, styles.fontSofiaRegular, styles.textDarkBlue, { letterSpacing: 2, paddingRight: 10 }]}>Tout sélectionner</Text>
                        <TouchableOpacity onPress={handleSelectAllProducts}>
                            {listProducts.length === listProductsSelected.allInfo.length ? (
                                <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                            ) : (
                                <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView style={{ marginBottom: 440 }}>
                        <FlatList data={filter.listProducts} renderItem={renderListProducts} keyExtractor={(item) => item["@id"]} />
                    </SafeAreaView>
                </>
            )}

            {!isLoading && tabActive === "sold" && (
                <SafeAreaView>
                    {productDetail ? renderSoldProductDetail() : <FlatList data={filter.listProducts} renderItem={renderListProducts} keyExtractor={(item) => item["@id"]} />}
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

export default Rayon;
