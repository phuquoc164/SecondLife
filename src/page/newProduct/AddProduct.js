/** React */
import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, TextInput, Linking, Platform, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

/** App */
import Picker from "../../components/Picker";
import ModalPhoto from "../../components/ModalPhoto";
import PickerCategories from "../../components/PickerCategories";
import SafeAreaViewParent from "../../components/SafeAreaViewParent";
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { initialProduct, stateDict } from "../../lib/constants";
import { AuthContext } from "../../lib/AuthContext";
import { getListOptionsProduct, loading, loadingScreen, verifyProduct } from "../../lib/Helpers";
import PickerBrand from "../../components/PickerBrand";

const AddProduct = (props) => {
    const { user } = React.useContext(AuthContext);
    const [isLoadingScreen, setIsLoadingScreen] = useState(false);
    const [isLoadingBtnSubmit, setIsLoadingBtnsubmit] = useState(false);
    const [product, setProduct] = useState(initialProduct);
    const [listOptions, setListOptions] = useState({
        brands: [],
        materials: [],
        colors: [],
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
        fetchArgus: false,
        voucherAmount: null,
        sellingPrice: null,
        buyingPrice: null
    });
    const [listErreurs, setListErreurs] = useState([]);

    const categoriesRef = React.useRef(categories);
    const setCategories = (categories) => {
        categoriesRef.current = categories;
        _setCategories(categories);
    };
    const scrollRef = React.useRef(null);

    /**
     * reset argus
     */
    const resetArgus = () => {
        setArgus({
            FetchService: false,
            voucherAmount: null,
            sellingPrice: null,
            buyingPrice: null
        });
    };

    /**
     * Reset data when we have the param force reset
     */
    React.useEffect(() => {
        if (props.route.params?.forceReset && listOptions.brands.length > 0) {
            setProduct(initialProduct);
            setBtnStatus("");
            setCategories({
                options: [],
                selectedIds: {},
                ids: {},
                prefix: {}
            });
            resetArgus();
            if (scrollRef && scrollRef.current) {
                scrollRef.current.scrollToPosition(0, 0);
            }
        } else {
            getListOptions();
        }
    }, [props.route.params]);

    /**
     * get list brand, size, state and seller
     * list categories depends on list brand
     */
    const getListOptions = async () => {
        const listOptions = await getListOptionsProduct(user.token);
        if (listOptions) {
            setListOptions({
                ...listOptions,
                isLoading: false
            });
        } else {
            Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
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
                        sendRequestToAddImage(response, "Take image error");
                    }
                });
            } else {
                console.debug("Camera permission denied");
                Alert.alert("Demande de permission", "Nous avons besoin des permissions pour accéder à votre caméra.", [
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
                        sendRequestToAddImage(response, "Select image error");
                    }
                });
            } else {
                console.debug("Photo permission denied");
                Alert.alert("Demande de permission", "Nous avons besoin des permissions pour accéder à votre bibliothèque photos.", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Paramètres", onPress: () => Linking.openSettings() }
                ]);
            }
        } catch (error) {
            console.warn(err);
        }
    };

    /**
     * send request to add image to server
     * @param {*} response
     * @param {*} errorMessage
     */
    const sendRequestToAddImage = (response, errorMessage) => {
        setIsLoadingScreen(true);
        FetchService.postImage(response, user.token)
            .then((result) => {
                if (!!result) {
                    setProduct({
                        ...product,
                        images: [...product.images, { base64: response.base64, id: result["@id"] }]
                    });
                    if (listErreurs.includes("images")) {
                        const newListErreurs = [...listErreurs];
                        newListErreurs.shift();
                        setListErreurs(newListErreurs);
                    }
                    setIsLoadingScreen(false);
                }
            })
            .catch((error) => {
                setIsLoadingScreen(false);
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * send request to delete the image
     * @param {*} imageId
     */
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
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * handle select brand and initialize list categories
     * @param {*} brand
     */
    const handleSelectBrand = (brand) => {
        setModal("");
        setIsLoadingScreen(true);
        if (!product.brand || product.brand.id !== brand.id) {
            // reset argus
            if (argus.fetchArgus) {
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
            setIsLoadingScreen(false);
        }
    };

    /**
     * send requeste to get the data of argus
     * @param {*} data
     * @returns
     */
    const handleArgus = (data) => {
        if (!product.brand || !product.brand.name) return;
        let endPoint = "/arguses?brand=" + product.brand.name;
        if (data.type === "category") {
            if (!product.state || !product.state.value || !product.material || !product.material.name) return;
            const categoriesData = data.value.replace("/", ".");
            endPoint += "&category=" + categoriesData + "&state=" + product.state.value + "&material=" + product.material.name;
        } else if (data.type === "state") {
            if (!product.category || !product.material || !product.material.name) return;
            const categoriesData = product.category.replace("/", ".");
            endPoint += "&category=" + categoriesData + "&state=" + data.value.value + "&material=" + product.material.name;
        } else if (data.type === "material") {
            if (!product.category || !product.state || !product.state.value) return;
            const categoriesData = product.category.replace("/", ".");
            endPoint += "&category=" + categoriesData + "&state=" + product.state.value + "&material=" + data.value.name;
        }
        setIsLoadingScreen(true);
        FetchService.get(endPoint, user.token)
            .then((result) => {
                if (!!result && result["hydra:member"].length > 0) {
                    const argus = result["hydra:member"][0];
                    setArgus({
                        fetchArgus: true,
                        voucherAmount: argus.voucherAmount,
                        sellingPrice: argus.sellingPrice,
                        buyingPrice: argus.buyingPrice
                    });
                } else {
                    setArgus({ ...argus, fetchArgus: true });
                }
                setIsLoadingScreen(false);
            })
            .catch((error) => {
                setIsLoadingScreen(false);
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * handle send request to add product
     * @returns
     */
    const handlSubmitForm = () => {
        const listErreurs = verifyProduct(product);
        if (listErreurs.length > 0) {
            Alert.alert("Erreur", "Veuillez renseigner tous les champs encadrés en rouge");
            setListErreurs(listErreurs);
            return;
        }
        setIsLoadingBtnsubmit(true);
        setListErreurs([]);
        const data = {
            title: product.title,
            images: product.images.map((image) => image.id),
            voucher: {
                voucherAmount: parseInt(product.voucherAmount.replace("€", "")),
                used: false
            },
            statuses: [
                {
                    status: btnStatus,
                    statusState: false
                }
            ],
            brand: product.brand.id,
            category: categoriesRef.current.selectedIds[product.category],
            material: product.material.id,
            color: product.color.id,
            seller: product.seller.id,
            customer: props.route.params.customerId,
            size: product.size.id,
            state: product.state.id,
            price: 0
        };

        // if (product.description && product.description !== "") {
        //     data["description"] = product.description;
        // }

        if (btnStatus === "sell") {
            props.navigation.navigate("NewProduct", {
                screen: "ResultPage",
                params: { data: { ...data, price: null, reference: null }, typeCatalog: "sell", sellingPrice: argus.sellingPrice, customerId: props.route.params.customerId }
            });
            setIsLoadingBtnsubmit(false);
        } else {
            FetchService.post("/products", data, user.token)
                .then((result) => {
                    if (result && result["@id"]) {
                        setProduct(initialProduct);
                        if (btnStatus === "partner") {
                            FetchService.get("/products?isSentToPartner=0", user.token)
                                .then((listProductsPartner) => {
                                    if (listProductsPartner) {
                                        const nbProducts = listProductsPartner["hydra:totalItems"];
                                        let description = "";
                                        if (nbProducts >= 15) {
                                            description = "Félicitations, vous avez ajouté 15 produits ! Contactez nous pour recevoir votre étiquette d'envoi !";
                                        } else {
                                            description = "Il vous reste " + (15 - nbProducts) + " produits à ajouter avant de pouvoir les envoyer à notre partenaire.";
                                        }
                                        const descriptionUnsentVouchers =
                                            result.customer.totalUnsentVouchers > 0 ? "Montant total de la reprise : " + result.customer.totalUnsentVouchers + "€" : null;
                                        props.navigation.navigate("NewProduct", {
                                            screen: "ResultPage",
                                            params: { typeCatalog: "partner", description, descriptionUnsentVouchers, customerId: result.customer["@id"] }
                                        });
                                    }
                                    setIsLoadingBtnsubmit(false);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                                });
                        } else {
                            props.navigation.navigate("NewProduct", {
                                screen: "ResultPage",
                                params: { typeCatalog: "donation", description: "Vous venez d’ajouter un nouveau produit pour votre association 🎉" }
                            });
                            setIsLoadingBtnsubmit(false);
                        }
                    }
                })
                .catch((error) => {
                    setIsLoadingBtnsubmit(false);
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                });
        }
    };

    if (listOptions.isLoading) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }
    return (
        <SafeAreaViewParent>
            <KeyboardAwareScrollView ref={scrollRef}>
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
                <View style={[styles.addProductInputContainer, listErreurs.includes("title") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Nom</Text>
                    <TextInput
                        style={[styles.addProductInput]}
                        placeholder="Choisissez le nom du produit"
                        placeholderTextColor={colors.gray2}
                        value={product.title}
                        onChangeText={(title) => setProduct({ ...product, title })}
                    />
                </View>

                {/* Brand */}
                <TouchableOpacity
                    onPress={() => setModal("brand")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("brand") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Marque</Text>
                    <Text style={[styles.addProductInput, { color: product.brand ? colors.darkBlue : colors.gray2 }]}>
                        {product.brand ? product.brand.name : "Sélectionnez une marque"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* Category */}
                <TouchableOpacity
                    disabled={!product.brand}
                    onPress={() => setModal("category")}
                    style={[
                        styles.addProductInputContainer,
                        styles.positionRelative,
                        !product.brand && { opacity: 0.4 },
                        listErreurs.includes("category") && { borderColor: colors.red }
                    ]}>
                    <Text style={styles.addProductLabel}>Catégorie</Text>
                    <Text style={[styles.addProductInput, { color: product.category ? colors.darkBlue : colors.gray2 }]}>
                        {product.category ? product.category : "Sélectionnez une catégorie"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* Material */}
                <TouchableOpacity
                    onPress={() => setModal("material")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("material") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Matériel</Text>
                    <Text style={[styles.addProductInput, { color: product.material ? colors.darkBlue : colors.gray2 }]}>
                        {product.material ? product.material.name : "Sélectionnez un matériel"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* Color */}
                <TouchableOpacity
                    onPress={() => setModal("color")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("color") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Couleur</Text>
                    <Text style={[styles.addProductInput, { color: product.color ? colors.darkBlue : colors.gray2 }]}>
                        {product.color ? product.color.name : "Sélectionnez une couleur"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* Size */}
                <TouchableOpacity
                    onPress={() => setModal("size")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("size") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Taille</Text>
                    <Text style={[styles.addProductInput, { color: product.size ? colors.darkBlue : colors.gray2 }]}>
                        {product.size ? product.size.name : "Renseignez la taille de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* State */}
                <TouchableOpacity
                    onPress={() => setModal("state")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("state") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Etat</Text>
                    <Text style={[styles.addProductInput, { color: product.state ? colors.darkBlue : colors.gray2 }]}>
                        {product.state ? product.state.name : "Indiquez l'état de l'article"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {/* Description */}
                {/* <View style={styles.addProductInputContainer}>
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
                </View> */}

                {/* Voucher */}
                <View style={[styles.addProductInputContainer, listErreurs.includes("voucherAmount") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Bon d'achat</Text>
                    <TextInput
                        style={[styles.addProductInput]}
                        placeholder="0,00€"
                        placeholderTextColor={colors.gray2}
                        value={product.voucherAmount}
                        onFocus={() => {
                            if (product.voucherAmount) {
                                const newValue = product.voucherAmount.replace("€", "");
                                setProduct({ ...product, voucherAmount: newValue });
                            }
                        }}
                        onBlur={() => {
                            if (product.voucherAmount) {
                                const newValue = (product.voucherAmount + "€").replace(",", ".");
                                setProduct({ ...product, voucherAmount: newValue });
                            }
                        }}
                        keyboardType="decimal-pad"
                        onChangeText={(voucherAmount) => setProduct({ ...product, voucherAmount })}
                    />
                    {argus.voucherAmount && <Text style={[styles.font14, styles.fontSofiaRegular, { color: colors.gray2 }]}>Montant conseillé: {argus.voucherAmount}€</Text>}
                </View>

                {/* Descrition argus */}
                {argus.fetchArgus && (
                    <View style={[styles.addProductInputContainer, { backgroundColor: "rgba(216, 255, 0, 0.22)", flexDirection: "row", alignItems: "center", padding: 15 }]}>
                        <Text style={[styles.font24, styles.fontSofiaRegular]}>💡</Text>
                        <Text
                            style={{
                                marginLeft: 15,
                                fontSize: 16,
                                lineHeight: 22,
                                width: "87%",
                                color: "#707070",
                                fontFamily: Platform.OS === "ios" ? "SofiaPro" : "SofiaPro-Regular"
                            }}>
                            {argus.buyingPrice ? `Prix de rachat: ${argus.buyingPrice}€` : "Nous ne reprenons malheureusement pas cet article."}
                        </Text>
                    </View>
                )}

                {/* Group Btn */}
                {(!argus.fetchArgus || argus.buyingPrice) && (
                    <TouchableOpacity
                        onPress={() => setBtnStatus("partner")}
                        style={[styles.addProductInputContainer, btnStatus === "partner" ? { backgroundColor: "rgba(14, 227, 138, 0.22)", padding: 20 } : { padding: 20 }]}>
                        <Text style={[styles.addProductLabel, styles.textCenter]}>Envoi</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => setBtnStatus("sell")}
                    style={[styles.addProductInputContainer, btnStatus === "sell" ? { backgroundColor: "rgba(14, 227, 138, 0.22)", padding: 20 } : { padding: 20 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter]}>Mise en rayon</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setBtnStatus("donation")}
                    style={[styles.addProductInputContainer, btnStatus === "donation" ? { backgroundColor: "rgba(14, 227, 138, 0.22)", padding: 20 } : { padding: 20 }]}>
                    <Text style={[styles.addProductLabel, styles.textCenter]}>Je donne à une association</Text>
                </TouchableOpacity>

                {/* Seller */}
                <TouchableOpacity
                    onPress={() => setModal("seller")}
                    style={[styles.addProductInputContainer, styles.positionRelative, listErreurs.includes("seller") && { borderColor: colors.red }]}>
                    <Text style={styles.addProductLabel}>Nom du vendeur</Text>
                    <Text style={[styles.addProductInput, { color: product.seller ? colors.darkBlue : colors.gray2 }]}>
                        {product.seller ? product.seller.name : "Sélectionnez un vendeur"}
                    </Text>
                    <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                </TouchableOpacity>

                {isLoadingBtnSubmit ? (
                    <View style={[styles.addProductInputContainer, styles.greenScreen, { paddingVertical: 20, marginBottom: 50 }]}>
                        <ActivityIndicator color={colors.white} />
                    </View>
                ) : (
                    <TouchableOpacity
                        disabled={btnStatus === ""}
                        onPress={handlSubmitForm}
                        style={[styles.addProductInputContainer, styles.greenScreen, { paddingVertical: 20, marginBottom: 50 }, btnStatus === "" && { opacity: 0.5 }]}>
                        <Text style={[styles.addProductLabel, styles.textCenter, styles.textWhite]}>Continuer</Text>
                    </TouchableOpacity>
                )}

                {/* ========================================== */}

                {/* Modal Brand */}
                <PickerBrand
                    visible={modal === "brand"}
                    title="Sélectionnez une marque"
                    items={listOptions.brands}
                    selected={product.brand}
                    token={user.token}
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

                {/* Modal Material */}
                <Picker
                    visible={modal === "material"}
                    title="Sélectionnez un matériel"
                    placeholderInputSearch="Cherchez un matériel"
                    items={listOptions.materials}
                    selected={product.material}
                    handleClose={() => setModal("")}
                    onSelected={(material) => {
                        setProduct({ ...product, material });
                        setModal("");
                        handleArgus({ type: "material", value: material });
                    }}
                />

                {/* Modal Color */}
                <Picker
                    visible={modal === "color"}
                    title="Sélectionnez une couleur"
                    placeholderInputSearch="Cherchez une couleur"
                    items={listOptions.colors}
                    selected={product.color}
                    handleClose={() => setModal("")}
                    onSelected={(color) => {
                        setModal("");
                        setProduct({ ...product, color });
                    }}
                />

                {/* Modal Size */}
                <Picker
                    visible={modal === "size"}
                    title="Sélectionnez une taille"
                    placeholderInputSearch="Cherchez une taille"
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
        </SafeAreaViewParent>
    );
};

export default AddProduct;
