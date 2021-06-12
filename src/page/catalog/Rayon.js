/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { convertDateToDisplay, InputSearch, loading } from "../../lib/Helpers";

const Rayon = (props) => {
    const [isLoading, setIsLoading] = useState(false);
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

    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        getListProducts();
    }, [tabActive]);

    const getListProducts = () => {
        setIsLoading(true);
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
                <View>
                    <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.title}</Text>
                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{item.brand.name}</Text>
                    <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{`${sellBy}${item.seller.name} - ${convertDateToDisplay(item.createAt)}`}</Text>
                </View>
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

    const handleSellProduct = () => {
        console.log("do something");
    }

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
            {!isLoading && tabActive === "sell" && (
                <>
                    <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Produits en vente</Text>
                        <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16]}>{nbProductsSelected} produits sélectionnés</Text>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, styles.textCenter, { marginBottom: 10 }]}>{nbProductsSelected}</Text>
                        <View style={{ alignSelf: "center", marginBottom: 10 }}>
                            <TouchableOpacity onPress={handleSellProduct} style={styles.btnSend}>
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
                    <FlatList data={filter.listProducts} renderItem={renderListProducts} keyExtractor={(item) => item["@id"]} />
                </SafeAreaView>
            )}
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
