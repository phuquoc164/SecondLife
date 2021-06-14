/** React */
import React from "react";
import { Text, View } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import CustomButton from "../../components/CustomButton";
import { colors } from "../../lib/colors";
import { TITLE } from "../../lib/constants";

const HEADER_CATALOG = [
    {
        title: TITLE.catalog[0],
        screenName: "OnceAgain"
    },
    {
        title: TITLE.catalog[1],
        screenName: "Rayon"
    },
    {
        title: TITLE.catalog[2],
        screenName: "Donation"
    }
];
const MenuChangeCatalog = (props) => {
    const listPages = HEADER_CATALOG.filter((header) => header.title !== props.route.params.title);

    return (
        <View style={{ flex: 1, alignItems: "center", marginTop: 75 }}>
            <View style={{ width: "85%" }}>
                {listPages.map((page, index) => (
                    <CustomButton
                        key={index}
                        btnContainerStyle={{ backgroundColor: colors.green, marginTop: 5 }}
                        title={page.title}
                        isLinear={false}
                        titleStyle={[styles.font24, styles.textWhite]}
                        onPress={() =>
                            props.navigation.navigate("Catalog", {
                                screen: page.screenName,
                                params: { forceUpdate: true, reference: null, deleteProduct: null, sellProduct: null }
                            })
                        }
                    />
                ))}
            </View>
        </View>
    );
};

export default MenuChangeCatalog;
