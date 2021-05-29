/** React */
import React from "react";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Linking, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { initialProduct, stateDict } from "../../lib/constants";
import { AuthContext } from "../../lib/AuthContext";
import { loading } from "../../lib/Helpers";
import Picker from "../../components/Picker";
import ModalPhoto from "../../components/ModalPhoto";
import PickerCategories from "../../components/PickerCategories";

const FormProduct = (props) => {
    const { user } = React.useContext(AuthContext);

    const [loadingScreen, setLoadingScreen] = React.useState();
    const [product, setProduct] = React.useState(initialProduct);
    const [listOptions, setListOptions] = React.useState({
        brands: [],
        sizes: [],
        states: [],
        sellers: [],
        isLoading: true
    });
    const [categories, _setCategories] = React.useState({
        options: [],
        selectedIds: {},
        ids: {},
        prefix: {}
    });
    const categoriesRef = React.useRef(categories);
    const setCategories = (categories) => {
        categoriesRef.current = categories;
        _setCategories(categories);
    };
    const [modal, setModal] = React.useState("");

    React.useEffect(() => {
        getListOptions();
    }, []);

    const getListOptions = async () => {
        try {
            const brandApi = await FetchService.get("/brands", user.token);
            const sizeApi = await FetchService.get("/sizes", user.token);
            const stateApi = await FetchService.get("/states", user.token);
            const sellerApi = await FetchService.get("/sellers", user.token);

            const listBrands = brandApi["hydra:member"].map((brand) => ({ id: brand["@id"], name: brand.name, categories: brand.categories }));
            const listSizes = sizeApi["hydra:member"].map((size) => ({ id: size["@id"], name: size["size"] }));
            const listStates = stateApi["hydra:member"].map((state) => ({ id: state["@id"], name: stateDict[state["state"]] }));
            const listSellers = sellerApi["hydra:member"].map((seller) => ({ id: seller["@id"], name: seller.name }));
            setListOptions({
                brands: listBrands,
                sizes: listSizes,
                states: listStates,
                sellers: listSellers,
                isLoading: false
            });
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * handle when user takes photo
     */
    const handleTakePhoto = async () => {
        setModal("");
        const options = {
            mediaType: "photo",
            maxWidth: 1000,
            maxHeight: 1000,
            includeBase64: true,
            quality: 0.9
        };
        const permissionCamera = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
        try {
            const granted = await request(permissionCamera);
            if (granted === RESULTS.GRANTED) {
                launchCamera(options, (response) => {
                    if (response.didCancel) {
                        console.debug("User cancelled image picker");
                    } else if (response.error || response.errorCode) {
                        console.debug("ImagePicker Error: ", response.error ? response.error : response.errorCode);
                    } else if (response.customButton) {
                        console.debug("User tapped custom button: ", response.customButton);
                    } else {
                        console.log(response);
                    }
                });
            } else {
                console.debug("Camera permission denied");
                Alert.alert("Demande de permission", "Nous avons besoin de la permission d'accéder à votre caméra.", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Paramètres", onPress: () => Linking.openSettings() }
                ]);
            }
        } catch (err) {
            console.warn(err);
        }
    };

    /**
     * handle when user selects photo from library
     */
    const handleSelectPhoto = async () => {
        setModal("");
        const options = {
            mediaType: "photo",
            maxWidth: 1000,
            maxHeight: 1000,
            includeBase64: true
        };
        let permissionPhoto = Platform.OS === "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

        try {
            const granted = await request(permissionPhoto);
            if (granted === RESULTS.GRANTED) {
                launchImageLibrary(options, (response) => {
                    if (response.didCancel) {
                        console.debug("User cancelled image picker");
                    } else if (response.error) {
                        console.debug("ImagePicker Error: ", response.error);
                    } else if (response.customButton) {
                        console.debug("User tapped custom button: ", response.customButton);
                    } else {
                        setArticle({
                            ...article,
                            pictures: [...article.pictures, response.base64]
                        });
                    }
                });
            } else {
                console.debug("Photo permission denied");
                Alert.alert("Demande de permission", "Nous avons besoin de la permission d'accéder à votre bibliothèque média.", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Paramètres", onPress: () => Linking.openSettings() }
                ]);
            }
        } catch (error) {
            console.warn(err);
        }
    };

    const handleSelectBrand = (brand) => {
        setModal("");
        if (!product.brand || product.brand.id !== brand.id) {
            setProduct({ ...product, brand, category: null });
            const listCategories = [];
            const listSelectedCategoryIds = [];
            const listCategoryIds = {};
            const listPrefix = {};

            brand.categories.forEach((category, index) => {
                listPrefix[category.name] = index;
                listCategoryIds[index + category.name] = category["@id"];
                listCategories.push(category);
                let categoryName = category.name;
                category.children.forEach((child) => {
                    categoryName += "/" + child.name;
                    listCategoryIds[index + child.name] = child["@id"];
                    if (child.children) {
                        child.children.forEach((c) => {
                            listCategoryIds[index + c.name] = c["@id"];
                            listSelectedCategoryIds[categoryName + "/" + c.name] = c["@id"];
                        });
                    } else {
                        listSelectedCategoryIds[categoryName] = child["@id"];
                    }
                    categoryName = category.name;
                });
            });
            setCategories({
                options: listCategories,
                selectedIds: listSelectedCategoryIds,
                ids: listCategoryIds,
                prefix: listPrefix
            });
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
                    <TouchableOpacity onPress={() => setModal("photo")} style={{ display: "flex", alignItems: "center", marginVertical: 20 }}>
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

                {/* Category */}
                <TouchableOpacity
                    disabled={!product.brand}
                    onPress={() => setModal("category")}
                    style={[componentStyle.inputContainer, styles.positionRelative, !product.brand && { opacity: 0.4 }]}>
                    <Text style={componentStyle.label}>Catégorie</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.category ? product.category : "Sélectionnez une catégorie"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Size */}
                <TouchableOpacity onPress={() => setModal("size")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Taille</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.size ? product.size.name : "Renseignez la taille de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* State */}
                <TouchableOpacity onPress={() => setModal("state")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Etat</Text>
                    <Text style={[componentStyle.input, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.state ? product.state.name : "Indiquez l'état de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Description */}
                <View style={componentStyle.inputContainer}>
                    <Text style={componentStyle.label}>Description</Text>
                    <TextInput
                        style={[componentStyle.input]}
                        placeholder={"Une remarque, un renseignement supplémentaire à fournir sur le produit ?\nC'est ici."}
                        placeholderTextColor={colors.gray2}
                        multiline={true}
                        numberOfLines={5}
                        value={product.description}
                        onChangeText={(description) => setProduct({ ...product, description })}
                    />
                </View>

                {/* Voucher */}
                <View style={componentStyle.inputContainer}>
                    <Text style={componentStyle.label}>Bon d'achat</Text>
                    <TextInput
                        style={[componentStyle.input]}
                        placeholder="0,00€"
                        placeholderTextColor={colors.gray2}
                        value={product.voucher}
                        onChangeText={(voucher) => setProduct({ ...product, voucher })}
                    />
                </View>

                <View style={[componentStyle.inputContainer, { backgroundColor: "rgba(216, 255, 0, 0.22)", flexDirection: "row", alignItems: "center", padding: 15 }]}>
                    <Text style={[styles.font24, styles.fontSofiaRegular]}>💡</Text>
                    <Text style={{ marginLeft: 15, fontSize: 16, lineHeight: 22, width: "87%", color: "#707070", fontFamily: "SofiaPro-Regular" }}>
                        Si l’article n’est pas vendu, notre partenaire Once Again s’engage à le racheter au prix de 0,00€
                    </Text>
                </View>

                <TouchableOpacity style={[componentStyle.inputContainer, { padding: 20 }]}>
                    <Text style={[componentStyle.label, styles.textCenter]}>Envoi à Once Again</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[componentStyle.inputContainer, { padding: 20 }]}>
                    <Text style={[componentStyle.label, styles.textCenter]}>Mise en rayon</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[componentStyle.inputContainer, { padding: 20 }]}>
                    <Text style={[componentStyle.label, styles.textCenter]}>Je donne à une association</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModal("seller")} style={[componentStyle.inputContainer, styles.positionRelative]}>
                    <Text style={componentStyle.label}>Nom du vendeur</Text>
                    <Text style={[componentStyle.input, { color: product.seller ? colors.darkBlue : colors.gray2 }]}>
                        {product.seller ? product.seller.name : "Sélectionnez un vendeur"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                <TouchableOpacity style={[componentStyle.inputContainer, styles.greenScreen, { paddingVertical: 20, marginBottom: 50}]}>
                    <Text style={[componentStyle.label, styles.textCenter, styles.textWhite]}>Continuer</Text>
                </TouchableOpacity>

                {/* ========================================== */}
                {/* Modal Brand */}
                <Picker
                    visible={modal === "brand"}
                    title="Sélectionnez une marque"
                    items={listOptions.brands}
                    selected={product.brand}
                    renderSearch={true}
                    handleClose={() => setModal("")}
                    onSelected={(brand) => handleSelectBrand(brand)}
                />

                {/* Modal Catégorie */}
                <PickerCategories
                    visible={modal === "category"}
                    title="Sélectionnez une catégorie"
                    items={categoriesRef.current.options}
                    categoryIds={categoriesRef.current.ids}
                    prefix={categoriesRef.current.prefix}
                    selected={product.category}
                    handleClose={() => setModal("")}
                    onSelected={(category) => {
                        setModal("");
                        setProduct({ ...product, category });
                        console.log(category);
                    }}
                />

                {/* Modal Size */}
                <Picker
                    visible={modal === "size"}
                    title="Sélectionnez une taille"
                    items={listOptions.sizes}
                    selected={product.size}
                    handleClose={() => setModal("")}
                    onSelected={(size) => {
                        setModal("");
                        setProduct({ ...product, size });
                    }}
                />

                {/* Modal State */}
                <Picker
                    visible={modal === "state"}
                    title="Sélectionnez un état"
                    items={listOptions.states}
                    selected={product.state}
                    handleClose={() => setModal("")}
                    onSelected={(state) => {
                        setProduct({ ...product, state });
                        setModal("");
                    }}
                />

                {/* Modal seller */}
                <Picker
                    visible={modal === "seller"}
                    title="Sélectionnez un vendeur"
                    items={listOptions.sellers}
                    selected={product.seller}
                    handleClose={() => setModal("")}
                    onSelected={(seller) => {
                        setModal("");
                        setProduct({ ...product, seller });
                    }}
                />

                <ModalPhoto visible={modal === "photo"} onCancel={() => setModal("")} handleTakePhoto={handleTakePhoto} handleSelectPhoto={handleSelectPhoto} />
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
    },
    btnActive: {
        backgroundColor: "rgba(14, 227, 138, 0.22)"
    }
});
export default FormProduct;
