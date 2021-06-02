/** React */
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Linking, Platform, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { initialProduct, stateDict } from "../../lib/constants";
import { AuthContext } from "../../lib/AuthContext";
import { loading, loadingScreen } from "../../lib/Helpers";
import Picker from "../../components/Picker";
import ModalPhoto from "../../components/ModalPhoto";
import PickerCategories from "../../components/PickerCategories";

let scrollRef = null;
const AddProduct = (props) => {
    const { user } = React.useContext(AuthContext);

    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const [product, setProduct] = useState(initialProduct);
    const [listOptions, setListOptions] = useState({
        brands: [],
        sizes: [],
        states: [],
        sellers: [],
        isLoading: true
    });
    const [categories, _setCategories] = useState({
        options: [],
        selectedIds: {},
        ids: {},
        prefix: {}
    });
    const [btnStatus, setBtnStatus] = useState("");
    const [modal, setModal] = useState("");
    const [argus, setArgus] = useState({
        voucherAmount: null,
        sellingPrice: null,
        buyingPrice: null
    });

    const categoriesRef = React.useRef(categories);
    const setCategories = (categories) => {
        categoriesRef.current = categories;
        _setCategories(categories);
    };

    const resetArgus = () => {
        setArgus({
            voucherAmount: null,
            sellingPrice: null,
            buyingPrice: null
        });
    };

    React.useEffect(() => {
        if (props.route.params.forceReset) {
            setProduct(initialProduct);
            setBtnStatus("");
            setCategories({
                options: [],
                selectedIds: {},
                ids: {},
                prefix: {}
            });
            resetArgus();
            if (scrollRef) {
                scrollRef.prrops.scrollToPosition(0, 0);
            }
        } else {
            getListOptions();
        }
    }, [props.route.params]);

    const getListOptions = async () => {
        try {
            const brandApi = await FetchService.get("/brands", user.token);
            const sizeApi = await FetchService.get("/sizes", user.token);
            const stateApi = await FetchService.get("/states", user.token);
            const sellerApi = await FetchService.get("/sellers", user.token);

            const listBrands = brandApi["hydra:member"].map((brand) => ({ id: brand["@id"], name: brand.name, categories: brand.categories }));
            const listSizes = sizeApi["hydra:member"].map((size) => ({ id: size["@id"], name: size["size"] }));
            const listStates = stateApi["hydra:member"].map((state) => ({ id: state["@id"], name: stateDict[state["state"]], value: state["state"] }));
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
                        FetchService.postImage(response, user.token)
                            .then((result) => {
                                if (!!result) {
                                    setProduct({
                                        ...product,
                                        images: [...product.images, { base64: response.base64, id: result["@id"] }]
                                    });
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                                // TODO: change text
                                Alert.alert("Take image error");
                            });
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
                        FetchService.postImage(response, user.token)
                            .then((result) => {
                                if (!!result) {
                                    setProduct({
                                        ...product,
                                        images: [...product.images, { base64: response.base64, id: result["@id"] }]
                                    });
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                                // TODO: change text
                                Alert.alert("Select image error");
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

    const handleDeletePhoto = (imageId) => {
        FetchService.delete(imageId, user.token)
            .then((result) => {
                if (!!result) {
                    const newImages = product.images.filter((image) => image.id !== imageId);
                    setProduct({
                        ...product,
                        images: newImages
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                // TODO: change text
                Alert.alert("Delete image error");
            });
    };

    const handleSelectBrand = (brand) => {
        setModal("");
        if (!product.brand || product.brand.id !== brand.id) {
            // reset argus
            if (argus.voucherAmount) {
                resetArgus();
            }

            setProduct({ ...product, brand, category: null });
            const listCategories = [];
            const listSelectedCategoryIds = {};
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
                    if (child.children.length > 0) {
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

    const handleArgus = (data) => {
        let endPoint = "/arguses?brand=" + product.brand.name;
        if (data.type === "category") {
            if (!product.state || !product.state.value) return;
            const categoriesData = data.value.split("/");
            endPoint += "&category=" + categoriesData[categoriesData.length - 1] + "&state=" + product.state.value;
        } else if (data.type === "state") {
            if (!product.category) return;
            const categoriesData = product.category.split("/");
            endPoint += "&category=" + categoriesData[categoriesData.length - 1] + "&state=" + data.value.value;
        }
        setIsLoadingScreen(true);
        console.log(endPoint);
        FetchService.get(endPoint, user.token)
            .then((result) => {
                console.log(result);
                if (!!result && result["hydra:member"].length > 0) {
                    const argus = result["hydra:member"][0];
                    setArgus({
                        voucherAmount: argus.voucherAmount,
                        sellingPrice: argus.sellingPrice,
                        buyingPrice: argus.buyingPrice
                    });
                }
                setIsLoadingScreen(false);
            })
            .catch((error) => {
                console.error(error);
                // TODO: chang text
                Alert.alert("Argus Erreur");
            });
    };

    const handlSubmitForm = () => {
        console.log(product);
        const data = {
            images: product.images.map((image) => image.id),
            vouchers: [
                {
                    voucherAmount: parseInt(product.voucherAmount),
                    used: false
                }
            ],
            statuses: [
                {
                    status: btnStatus,
                    statusState: false
                }
            ],
            brand: product.brand.id,
            category: categoriesRef.current.selectedIds[product.category],
            seller: product.seller.id,
            customer: props.route.params.customerId,
            size: product.size.id,
            state: product.state.id,
            description: product.description,
            price: 0,
            reference: ""
        };

        console.log(data);
        if (btnStatus === "sell") {
            props.navigation.navigate("NewProduct", { screen: "ResultPage", params: { data, typeCatalog: "sell", sellingPrice: argus.sellingPrice } });
        } else {
            FetchService.post("/products", data, user.token)
                .then((result) => {
                    console.log("products", result);
                    if (result && result["@id"]) {
                        if (btnStatus === "partner") {
                            const data = { products: [{ product: result["@id"] }] };
                            FetchService.post("/shipments", data, user.token).then((shipment) => {
                                if (shipment && shipment["@id"]) {
                                    let description = "";
                                    if (shipment.closed) {
                                        description = "Vous avez ajouté 15 produits, rendez-vous sur votre back-office pour télécharger votre étiquette d'envoi !"
                                    } else {
                                        description = "Il vous reste " + shipment.leftProducts + " produits à ajouter avant de pouvoir les envoyer à Once Again."
                                    }
                                    props.navigation.navigate("NewProduct", {
                                        screen: "ResultPage",
                                        params: { typeCatalog: "partner", description }
                                    });
                                }
                            });
                        } else {
                            props.navigation.navigate("NewProduct", {
                                screen: "ResultPage",
                                params: { typeCatalog: "donation", description: "Vous venez d’ajouter un nouveau produit pour votre association 🎉" }
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    // TODO: set text
                    Alert.alert("Add product error");
                });
        }
    };

    if (listOptions.isLoading) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }
    return (
        <SafeAreaView style={styles.mainScreen}>
            <KeyboardAwareScrollView
                innerRef={(ref) => {
                    scrollRef = ref;
                }}>
                <View style={[styles.addProductInputContainer, { paddingVertical: 20, marginTop: 20 }]}>
                    <Text style={[styles.textCenter, styles.addProductLabel]}>Ajoute jusqu'à 5 photos</Text>
                    {product.images.length === 0 && (
                        <TouchableOpacity onPress={() => setModal("photo")} style={{ display: "flex", alignItems: "center", marginVertical: 20 }}>
                            <Image source={require("../../assets/images/image_upload.png")} style={{ width: 220, height: 209.1 }} />
                        </TouchableOpacity>
                    )}

                    {product.images.length > 0 && (
                        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 15 }}>
                            {product.images.map((image) => (
                                <View key={image.id} style={{ width: "33.3%", aspectRatio: 1, padding: 5, position: "relative" }}>
                                    <TouchableOpacity
                                        onPress={() => handleDeletePhoto(image.id)}
                                        style={{
                                            position: "absolute",
                                            top: -2,
                                            right: -2,
                                            zIndex: 2,
                                            backgroundColor: colors.white,
                                            borderRadius: 50,
                                            padding: 4
                                        }}>
                                        <Image source={require("../../assets/images/cross-black.png")} style={{ width: 10.5, height: 10 }} />
                                    </TouchableOpacity>
                                    <Image
                                        source={{
                                            uri: "data:image/png;base64," + image.base64
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            resizeMode: "cover"
                                        }}
                                    />
                                </View>
                            ))}
                            {product.images.length < 5 && (
                                <View
                                    style={{
                                        width: "33.3%",
                                        aspectRatio: 1,
                                        padding: 20,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                    <TouchableOpacity onPress={() => setModal("photo")}>
                                        <Image source={require("../../assets/images/plus.png")} style={{ width: 57, height: 57 }} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Nom */}
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Nom</Text>
                    <TextInput
                        style={[styles.addProductInput]}
                        placeholder="Choisissez le nom du produit"
                        placeholderTextColor={colors.gray2}
                        value={product.name}
                        onChangeText={(name) => setProduct({ ...product, name })}
                    />
                </View>

                {/* Brand */}
                <TouchableOpacity onPress={() => setModal("brand")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                    <Text style={styles.addProductLabel}>Marque</Text>
                    <Text style={[styles.addProductInput, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.brand ? product.brand.name : "Sélectionnez une marque"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Category */}
                <TouchableOpacity
                    disabled={!product.brand}
                    onPress={() => setModal("category")}
                    style={[styles.addProductInputContainer, styles.positionRelative, !product.brand && { opacity: 0.4 }]}>
                    <Text style={styles.addProductLabel}>Catégorie</Text>
                    <Text style={[styles.addProductInput, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.category ? product.category : "Sélectionnez une catégorie"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Size */}
                <TouchableOpacity onPress={() => setModal("size")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                    <Text style={styles.addProductLabel}>Taille</Text>
                    <Text style={[styles.addProductInput, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.size ? product.size.name : "Renseignez la taille de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* State */}
                <TouchableOpacity onPress={() => setModal("state")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                    <Text style={styles.addProductLabel}>Etat</Text>
                    <Text style={[styles.addProductInput, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.state ? product.state.name : "Indiquez l'état de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                {/* Description */}
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Description</Text>
                    <TextInput
                        style={[styles.addProductInput]}
                        placeholder={"Une remarque, un renseignement supplémentaire à fournir sur le produit ?\nC'est ici."}
                        placeholderTextColor={colors.gray2}
                        multiline={true}
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={product.description}
                        onChangeText={(description) => setProduct({ ...product, description })}
                    />
                </View>

                {/* Voucher */}
                <View style={styles.addProductInputContainer}>
                    <Text style={styles.addProductLabel}>Bon d'achat</Text>
                    <TextInput
                        style={[styles.addProductInput]}
                        placeholder="0,00€"
                        placeholderTextColor={colors.gray2}
                        value={product.voucherAmount}
                        keyboardType="decimal-pad"
                        onChangeText={(voucherAmount) => setProduct({ ...product, voucherAmount })}
                    />
                    {argus.voucherAmount && <Text style={[styles.font14, styles.fontSofiaRegular, { color: colors.gray2 }]}>Montant consseillé: {argus.voucherAmount}€</Text>}
                </View>

                <View style={[styles.addProductInputContainer, { backgroundColor: "rgba(216, 255, 0, 0.22)", flexDirection: "row", alignItems: "center", padding: 15 }]}>
                    <Text style={[styles.font24, styles.fontSofiaRegular]}>💡</Text>
                    <Text style={{ marginLeft: 15, fontSize: 16, lineHeight: 22, width: "87%", color: "#707070", fontFamily: "SofiaPro-Regular" }}>
                        Si l’article n’est pas vendu, notre partenaire Once Again s’engage à le racheter au prix de {argus.buyingPrice ? argus.buyingPrice : "0,00"}€
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setBtnStatus("partner")}
                    style={[styles.addProductInputContainer, btnStatus === "partner" && componentStyle.btnActive, { padding: 20 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter]}>Envoi à Once Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setBtnStatus("sell")}
                    style={[styles.addProductInputContainer, btnStatus === "sell" && componentStyle.btnActive, { padding: 20 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter]}>Mise en rayon</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setBtnStatus("donation")}
                    style={[styles.addProductInputContainer, btnStatus === "donation" && componentStyle.btnActive, { padding: 20 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter]}>Je donne à une association</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModal("seller")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                    <Text style={styles.addProductLabel}>Nom du vendeur</Text>
                    <Text style={[styles.addProductInput, { color: product.seller ? colors.darkBlue : colors.gray2 }]}>
                        {product.seller ? product.seller.name : "Sélectionnez un vendeur"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={componentStyle.chevronDown} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handlSubmitForm} style={[styles.addProductInputContainer, styles.greenScreen, { paddingVertical: 20, marginBottom: 50 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter, styles.textWhite]}>Continuer</Text>
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
                        handleArgus({ type: "category", value: category });
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
                        handleArgus({ type: "state", value: state });
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
                {loadingScreen(isLoadingScreen)}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const componentStyle = StyleSheet.create({
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
export default AddProduct;
