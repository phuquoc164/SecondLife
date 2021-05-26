/** React */
import React from "react";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Modal } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { initialProduct, stateDict } from "../../lib/constants";
import { AuthContext } from "../../lib/AuthContext";
import { loading } from "../../lib/Helpers";
import Picker from "../../components/Picker";

const FormProduct = (props) => {
    const { user } = React.useContext(AuthContext);
    const [product, setProduct] = React.useState(initialProduct);
    const [listOptions, setListOptions] = React.useState({
        brands: [],
        sizes: [],
        states: [],
        isLoading: true
    });
    const [listCategories, setListCategories] = React.useState([]);
    const [modal, setModal] = React.useState([]);

    React.useEffect(() => {
        getListOptions();
    }, []);

    const getListOptions = async () => {
        try {
            const brandApi = await FetchService.get("/brands", user.token);
            const sizeApi = await FetchService.get("/sizes", user.token);
            const stateApi = await FetchService.get("/states", user.token);

            const listBrands = brandApi["hydra:member"].map((brand) => ({ id: brand["@id"], name: brand.name, categories: brand.categories }));
            const listSizes = sizeApi["hydra:member"].map((size) => ({ id: size["@id"], name: size["size"] }));
            const listStates = stateApi["hydra:member"].map((state) => ({ id: state["@id"], name: stateDict[state["state"]] }));
            setListOptions({
                brands: listBrands,
                sizes: listSizes,
                states: listStates,
                isLoading: false
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (listOptions.isLoading) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }

    return (
        <SafeAreaView style={styles.mainScreen}>
            <KeyboardAwareScrollView>
                <View style={[componentStyle.inputContainer, { paddingVertical: 20, marginTop: 20 }]}>
                    <Text style={[styles.textCenter, componentStyle.label]}>Ajoute jusqu'à 5 photos</Text>
                    <TouchableOpacity style={{ display: "flex", alignItems: "center", marginVertical: 20 }}>
                        <Image source={require("../../assets/images/image_upload.png")} style={{ width: 220, height: 209.1 }} />
                    </TouchableOpacity>
                </View>

                {/* Nom */}
                <View style={componentStyle.inputContainer}>
                    <Text style={componentStyle.label}>Nom</Text>
                    <TextInput
                        style={[componentStyle.input]}
                        placeholder="Choisissez le nom du produit"
                        placeholderTextColor={colors.gray2}
                        value={product.name}
                        onChangeText={(name) => setProduct({ ...product, name })}
                    />
                </View>

                {/* Brand */}
                <TouchableOpacity onPress={() => setModal("brand")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Marque</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.brand ? product.brand.name : "Sélectionnez une marque"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Size */}
                <TouchableOpacity onPress={() => setModal("size")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Taille</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.brand ? product.brand.name : "Renseignez la taille de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* State */}
                <TouchableOpacity onPress={() => setModal("state")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Etat</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.brand ? product.brand.name : "Indiquez l'état de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>
                {/* Modal Brand */}
                <Picker
                    visible={modal === "brand"}
                    title="Sélectionnez une marque"
                    items={listOptions.brands}
                    selected={product.brand}
                    renderSearch={true}
                    onSelected={(brand) => {
                        setModal("");
                        setProduct({ ...product, brand, category: null });
                        const listCategories = brand.categories.map((category) => ({ id: category["@id"], name: category.name, children: category.children }));
                        setListCategories(listCategories);
                    }}
                />

                {/* Modal Size */}
                <Picker
                    visible={modal === "size"}
                    title="Sélectionnez une taille"
                    items={listOptions.sizes}
                    selected={product.size}
                    onSelected={(size) => {
                        setModal("");
                    }}
                />

                <Picker
                    visible={modal === "state"}
                    title="Sélectionnez un état"
                    items={listOptions.states}
                    selected={product.state}
                    onSelected={(state) => {
                        setModal("");
                    }}
                />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const componentStyle = StyleSheet.create({
    inputContainer: {
        borderColor: "rgba(0, 0, 0, 0.22)",
        borderWidth: 1,
        borderRadius: 15,
        marginHorizontal: 30,
        padding: 10,
        marginBottom: 20
    },
    label: {
        color: colors.textDarkBlue,
        fontSize: 20,
        fontFamily: "SofiaPro-Regular"
    },
    input: {
        padding: 0,
        margin: 0,
        fontFamily: "SofiaPro-Regular",
        color: colors.textDarkBlue,
        fontSize: 16
    },
    chevronDown: {
        position: "absolute",
        width: 40,
        height: 33.2,
        top: 22.5,
        right: 20
    }
});
export default FormProduct;
