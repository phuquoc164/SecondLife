/** React */
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
const listItems = ["Customer", "Scanner", "Home", "Catalog", "Voucher"];
const listItemsData = {
    Customer: {
        title: "Clients",
        image: require(`../assets/images/client-item.png`),
        imageStyle: { width: 26.3, height: 26 },
        screen: "ListCustomers"
    },
    Scanner: {
        title: "Scanner",
        image: require(`../assets/images/scanner-item.png`),
        imageStyle: { width: 26, height: 26 },
        screen: "ScannerScreen"
    },
    Catalog: {
        title: "Catalogue",
        image: require(`../assets/images/catalog-item.png`),
        imageStyle: { width: 28.5, height: 26 },
        screen: "OnceAgain"
    },
    Voucher: {
        title: "Bons d'achat",
        image: require(`../assets/images/voucher-item.png`),
        imageStyle: { width: 26, height: 26 },
        screen: "ActifVouchers"
    }
};

const BottomBarMenu = ({ state, navigation }) => {
    if (!state) {
        return null;
    }
    const lastHistory = state.history[state.history.length - 1];

    return (
        <View style={stylesMenu.main}>
            {state.routes.map((route, index) => {
                const { name, key } = route;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: key
                    });

                    if (!event.defaultPrevented) {
                        if (name === "Home") {
                            navigation.navigate("Home");
                        } else {
                            navigation.navigate(name, {
                                screen: listItemsData[name].screen,
                                params: { forceUpdate: true }
                            });
                        }
                    }
                };

                if (!listItems.includes(name)) return null;
                if (name === "Home" && lastHistory.key.includes("Home")) {
                    return (
                        <Image
                            key={key}
                            source={require("../assets/images/1.png")}
                            style={[
                                stylesMenu.btnHome,
                                {
                                    width: 90,
                                    height: 94.1
                                }
                            ]}
                        />
                    );
                } else if (name === "Home") {
                    return (
                        <TouchableOpacity onPress={onPress} key={key}>
                            <Image
                                source={require("../assets/images/2.png")}
                                style={[
                                    stylesMenu.btnHome,
                                    {
                                        width: 90,
                                        height: 94.1
                                    }
                                ]}
                            />
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity key={key} onPress={onPress} style={[styles.flex1, stylesMenu.item]}>
                        <Image source={listItemsData[name].image} style={listItemsData[name].imageStyle} />
                        <Text style={[styles.fontSofiaRegular, styles.font12, styles.textCenter]}>{listItemsData[name].title}</Text>
                        {isFocused && (
                            <View style={stylesMenu.activeTab}>
                                <View style={stylesMenu.tab}></View>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default BottomBarMenu;

const stylesMenu = StyleSheet.create({
    main: {
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
        width: "100%",
        marginBottom: -10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    item: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    btnHome: {
        position: "relative",
        top: -40
    },
    thunder: {
        top: -60
    },
    activeTab: {
        position: "absolute",
        bottom: 15,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center"
    },
    tab: {
        width: 8,
        height: 8,
        backgroundColor: colors.green,
        borderRadius: 4
    }
});
