/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { InputSearch, loading } from "../../lib/Helpers";

const Donation = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [tabActive, setTabActive] = useState("give");
    const [listProducts, setListProducts] = useState([
        {
            "@id": 1,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        },
        {
            "@id": 2,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        },
        {
            "@id": 3,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        },
        {
            "@id": 4,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        },
        {
            "@id": 5,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        },
        {
            "@id": 6,
            name: "Echarpe rouge",
            brand: "Hermes",
            seller: "Eugénie",
            date: "11.02.2021"
        }
    ]);
    const [listProductsSelected, setListProductsSelected] = useState({
        allInfo: [],
        ids: []
    });
    const [filter, setFilter] = useState({
        keyword: "",
        listProducts: [
            {
                "@id": 1,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                "@id": 2,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                "@id": 3,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                "@id": 4,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                "@id": 5,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                "@id": 6,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            }
        ]
    });

    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {}, [tabActive]);

    // TODO: get list products
    const getListProducts = (tabActive) => {
        setIsLoading(true);
    };

    /**
     * Render List products
     * @param {*} param0
     * @returns
     */
    const renderListProducts = ({ item }) => (
        <View key={item["@id"]} style={styles.singleProduct}>
            <View>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.name}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{item.brand}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{`${item.seller} - ${item.date}`}</Text>
            </View>
            <TouchableOpacity onPress={() => handleSelectProduct(item)}>
                {listProductsSelected.ids.includes(item["@id"]) ? (
                    <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                ) : (
                    <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                )}
            </TouchableOpacity>
        </View>
    );

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

    const filterData = (filter) => {};

    return (
        <View style={styles.mainScreen}>
            <View style={styles.menuNavigationContainer}>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("give")} style={{ alignSelf: "center" }}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "give" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>À donner</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => setTabActive("gave")}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "gave" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>Donnés</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && loading()}
            {!isLoading && tabActive === "give" && (
                <>
                    <InputSearch placeholder="Chercher une commande, un n° de suivi..." placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />

                    <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Préparation des dons en cours</Text>
                        <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16]}>7 produits sélectionnés</Text>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, styles.textCenter, { marginBottom: 10 }]}>7</Text>
                        <View style={{ alignSelf: "center", marginBottom: 10 }}>
                            <TouchableOpacity style={styles.btnSend}>
                                <Image source={require("../../assets/images/don.png")} style={styles.imageBtnSend} />
                                <Text style={[styles.textDarkBlue, styles.font17, styles.fontSofiaRegular, { top: -0.5, paddingRight: 10, paddingLeft: 5 }]}>
                                    Marquer comme donné
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

            {!isLoading && tabActive === "gave" && (
                <SafeAreaView>
                    {/* <FlatList data={filter.listProducts} /> */}
                    <Text>Gave</Text>
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

export default Donation;
