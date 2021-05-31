/** React */
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";
import ProgressCircle from "react-native-progress-circle";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { InputSearch, loading } from "../../lib/Helpers";

const OnceAgain = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [tabActive, setTabActive] = useState("send");
    const [listProducts, setListProducts] = useState([]);
    const [listProductsSelected, setListProductsSelected] = useState({
        allInfo: [],
        ids: []
    });
    const [filter, setFilter] = useState({
        keyword: "",
        listProducts: [
            {
                id: 1,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                id: 2,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                id: 3,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                id: 4,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                id: 5,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            },
            {
                id: 6,
                name: "Echarpe rouge",
                brand: "Hermes",
                seller: "Eugénie",
                date: "11.02.2021"
            }
        ]
    });

    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {

    }, [tabActive]);

    const getListProducts = (tabActive) => {
        setIsLoading(true);
        
    }

    const toggleTab = (type) => {
        if (type === "send") {

        } else if (type === "sent") {

        }
    }

    /**
     * Render List products
     * @param {*} param0 
     * @returns 
     */
    const renderListProductsSend = ({ item }) => (
        <View key={item.id} style={styles.singleProduct}>
            <View>
                <Text style={[styles.font20, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.name}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{item.brand}</Text>
                <Text style={[styles.font16, styles.fontSofiaRegular, styles.textMediumGray]}>{`${item.seller} - ${item.date}`}</Text>
            </View>
            <TouchableOpacity onPress={() => handleSelectProduct(item)}>
                {listProductsSelected.ids.includes(item.id) ? (
                    <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                ) : (
                    <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                )}
            </TouchableOpacity>
        </View>
    );

    const renderListProductsSent = ({item}) => (
        <View key={item.id}>

        </View>
    )

    /**
     * Handle select or unselect all products
     */
    const handleSelectAllProducts = () => {
        if (listProductsSelected.allInfo.length === listProducts.send.length) {
            setListProductsSelected({
                allInfo: [],
                ids: []
            });
        } else {
            const ids = listProducts.send.map(product => product.id);
            setListProductsSelected({
                allInfo: listProducts.send,
                ids
            });
        }
    }

    /** Handle select or unselect one product */
    const handleSelectProduct = (item) => {
        if (listProductsSelected.ids.includes(item.id)) {
            const listNewProducts = listProductsSelected.allInfo.filter(product => product.id !== item.id);
            const listNewIds = listProductsSelected.ids.filter(id => id !== item.id);
            setListProductsSelected({
                allInfo: listNewProducts,
                ids: listNewIds
            });
        } else {
            setListProductsSelected({
                allInfo: [...listProductsSelected.allInfo, item],
                ids: [...listProductsSelected.ids, item.id]
            });
        }
    }

    const filterData = (filter) => {};

    if (isLoading) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }
    return (
        <View style={styles.mainScreen}>
            <View style={styles.menuNavigationContainer}>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => toggleTab("send")} style={{ alignSelf: "center" }}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "send" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>À envoyer</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                    <TouchableOpacity onPress={() => toggleTab("sent")}>
                        <Text style={[styles.menuNavigationLabel, tabActive !== "sent" && { color: colors.mediumGray, borderBottomWidth: 0 }]}>Envoyés</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <InputSearch placeholder="Chercher une commande, un n° de suivi..." placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />

            {tabActive === "send" && (
                <>
                    <View style={[componentStyle.container, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                        <Text style={[styles.textDarkBlue, styles.fontSofiaMedium, styles.font20]}>Préparation de l'envoi en cours</Text>
                        <Text style={[styles.textMediumGray, styles.fontSofiaRegular, styles.font16]}>8 produits à sélectionner</Text>
                        <View style={{ alignItems: "center", paddingVertical: 15 }}>
                            <ProgressCircle
                                percent={(7 / 15) * 100}
                                radius={55}
                                borderWidth={3}
                                color={colors.green}
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
                                    <Text style={[styles.textDarkBlue, styles.fontSofiaSemiBold, styles.font60, { top: -5 }]}>7</Text>
                                    <Text style={[styles.textGreen, styles.fontSofiaRegular, styles.positionAbsolute, styles.font18, { bottom: 18, right: -15 }]}>/15</Text>
                                </View>
                            </ProgressCircle>
                        </View>
                        <View style={{ alignSelf: "center", marginBottom: 10 }}>
                            <TouchableOpacity style={styles.btnSend}>
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
                            {listProducts.send.length === listProductsSelected.allInfo.length ? (
                                <Image source={require("../../assets/images/selected.png")} style={{ width: 30, height: 30 }} />
                            ) : (
                                <Image source={require("../../assets/images/not-selected.png")} style={{ width: 30, height: 30 }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView style={{ marginBottom: 490 }}>
                        <FlatList data={filter.listProducts} renderItem={renderListProductsSend} keyExtractor={(item) => item["@id"]} />
                    </SafeAreaView>
                </>
            )}

            {tabActive === "sent" && (
                <SafeAreaView>
                    <FlatList data={filter.listProducts} />
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

export default OnceAgain;
