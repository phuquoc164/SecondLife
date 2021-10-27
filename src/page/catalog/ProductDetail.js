/** React */
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Config from "react-native-config";
/** App */
import Picker from "../../components/Picker";
import PickerBrand from "../../components/PickerBrand";
import PickerCategories from "../../components/PickerCategories";
import ModalConfirmation from "../../components/ModalConfirmation";
import ModalPhoto from "../../components/ModalPhoto";
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { convertDateToDisplay, getKeyByValue, getListOptionsProduct, loading, loadingScreen } from "../../lib/Helpers";
import { colors } from "../../lib/colors";
import { stateDict } from "../../lib/constants";
import SafeAreaViewParent from "../../components/SafeAreaViewParent";

const paddingBottomText = Platform.OS === "ios" ? 5 : 0;
const API_URL = Config.API_URL;

const ProductDetail = (props) => {
    const [editable, setEditable] = useState(false);
    const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(false);
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [product, setProduct] = useState(null);
    const [modal, setModal] = useState("");
    const [listOptions, setListOptions] = useState({
        brands: [],
        sizes: [],
        states: [],
        sellers: []
    });
    const [categories, _setCategories] = useState({
        options: [],
        selectedIds: {},
        ids: {},
        prefix: {}
    });

    const productRef = React.useRef(product);
    const categoriesRef = React.useRef(categories);
    const setCategories = (categories) => {
        categoriesRef.current = categories;
        _setCategories(categories);
    };

    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        if (props.route.params && props.route.params.productId) {
            getProduct(props.route.params.productId);
        }
    }, [props.route.params]);

    const getProduct = (productId) => {
        FetchService.get(productId, user.token)
            .then((result) => {
                if (result && result["@id"]) {
                    productRef.current = result;
                    formatProduct(result);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    const formatProduct = (allInfoProduct) => {
        const { title, brand, category, material, images, size, state, seller } = allInfoProduct;
        const product = {
            id: allInfoProduct["@id"],
            title,
            brand: { id: brand["@id"], name: brand.name },
            category: category.name,
            material: material ? { id: material["@id"], name: material.material } : null,
            // description,
            images,
            size: { id: size["@id"], name: size.size },
            state: { id: state["@id"], name: stateDict[state["state"]], value: state["state"] },
            seller: { id: seller["@id"], name: seller.name }
        };
        setProduct(product);
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
                        sendRequestToAddImage(response, "select image error");
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
                        sendRequestToAddImage(response, "Take image error");
                    }
                });
            } else {
                console.debug("Photo permission denied");
                Alert.alert("Demande de permission", "Nous avons besoin des permissions pour accéder à votre bibliothèque photo.", [
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
        setIsLoadingScreenVisible(true);
        FetchService.postImage(response, user.token)
            .then((result) => {
                if (!!result) {
                    setProduct({
                        ...product,
                        images: [...product.images, { base64: response.base64, id: result["@id"] }]
                    });
                    setIsLoadingScreenVisible(false);
                }
            })
            .catch((error) => {
                setIsLoadingScreenVisible(false);
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * Send request to delete image on server and update images
     * @param {*} imageId
     */
    const handleDeletePhoto = (imageDeleted) => {
        if (imageDeleted["@id"]) {
            FetchService.delete(imageDeleted["@id"], user.token)
                .then((result) => {
                    if (!!result) {
                        const newImages = product.images.filter((image) => image["@id"] !== imageDeleted["@id"]);
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
        } else {
            const newImages = product.images.filter((image) => image.id !== imageDeleted.id);
            setProduct({
                ...product,
                images: newImages
            });
        }
    };

    /**
     * get list options which include brand, size, state and seller
     * list category depends on brand
     */
    const getListOptions = async () => {
        const listOptions = await getListOptionsProduct(user.token);
        if (listOptions) {
            const brandSelected = listOptions.brands.find((brand) => brand.id === product.brand.id);
            if (brandSelected) {
                const listOptionCategories = initListOptionCategories(brandSelected);
                const categoryName = getKeyByValue(listOptionCategories.selectedIds, productRef.current.category["@id"]);
                setProduct({ ...product, category: categoryName });
                setCategories(listOptionCategories);
            } else {
                setProduct({ ...product, brand: null });
            }
            setListOptions(listOptions);
        } else {
            Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
        }
    };

    /**
     * Selete brand and initialize list category
     * @param {*} brand
     */
    const handleSelectBrand = (brand) => {
        setModal("");
        if (!product.brand || product.brand.id !== brand.id) {
            setProduct({ ...product, brand, category: null });
            setCategories(initListOptionCategories(brand));
        }
    };

    const initListOptionCategories = (brand) => {
        // listSelectedCategoryIds helps finding the id of selected category
        // listCategoryIds is the list of all category
        const listCategories = [];
        const listSelectedCategoryIds = {};
        const listCategoryIds = {};
        const listPrefix = {};
        brand.categories &&
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

        return {
            options: listCategories,
            selectedIds: listSelectedCategoryIds,
            ids: listCategoryIds,
            prefix: listPrefix
        };
    };

    /**
     * handleModifyProduct
     */
    const handleModifyProduct = async () => {
        setEditable(true);
        if (listOptions.brands.length === 0) {
            setIsLoadingScreenVisible(true);
            await getListOptions();
            setIsLoadingScreenVisible(false);
        } else {
            const brandSelected = listOptions.brands.find((brand) => brand.id === product.brand.id);
            if (brandSelected) {
                const listOptionCategories = initListOptionCategories(brandSelected);
                const categoryName = getKeyByValue(listOptionCategories.selectedIds, productRef.current.category.id);
                setProduct({ ...product, category: categoryName });
                setCategories(listOptionCategories);
            } else {
                setProduct({ ...product, brand: null });
            }
        }
        props.navigation.setOptions({ title: "Modifier les informations" });
    };

    /**
     * Delete product and ,avigation to dedicated page catalog
     */
    const handleDeleteProduct = () => {
        setIsLoadingScreenVisible(true);
        FetchService.delete(product.id, user.token)
            .then((result) => {
                if (result) {
                    setIsLoadingScreenVisible(false);
                    props.navigation.navigate("Catalog", {
                        screen: props.route.params.screen,
                        params: { deleteProduct: true, sellProduct: null, reference: null, forceUpdate: null }
                    });
                }
            })
            .catch((error) => {
                setIsLoadingScreenVisible(false);
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * Send request to save the modification of product
     */
    const handleSaveModification = () => {
        let data = {};
        let isError = false;
        Object.keys(product).forEach((key) => {
            if (["brand", "size", "seller", "state", "material"].includes(key)) {
                if (!product[key] || !product[key].id) {
                    isError = true;
                } else if (productRef.current[key]["@id"] !== product[key].id) {
                    data[key] = product[key].id;
                }
            } else if (key === "category") {
                const idSelected = categoriesRef.current.selectedIds[product.category];
                if (!idSelected) {
                    isError = true;
                } else if (idSelected !== productRef.current.category["@id"]) {
                    data[key] = idSelected;
                }
            } else if (productRef.current[key] !== product[key]) {
                data[key] = product[key];
            }
        });

        if (isError) {
            Alert.alert("Erreur", "Veuillez vous saisir toutes les informations");
            return;
        }
        if (Object.keys(data).length > 0) {
            setIsLoadingScreenVisible(true);
            FetchService.patch(productRef.current["@id"], data, user.token)
                .then((result) => {
                    if (result) {
                        setEditable(false);
                        props.navigation.setOptions({ title: "Informations produit" });
                        setIsLoadingScreenVisible(false);
                    }
                })
                .catch((error) => {
                    setIsLoadingScreenVisible(false);
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                });
        } else {
            handleResetModification();
        }
    };

    const handleResetModification = () => {
        formatProduct(productRef.current);
        setEditable(false);
        props.navigation.setOptions({ title: "Informations produit" });
    };

    if (!product || !productRef.current) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }

    const voucher = productRef.current?.vouchers ? productRef.current?.vouchers[0] : null;
    let statusVoucher = "";
    if (voucher) {
        statusVoucher = voucher.used ? "Utilisé" : voucher.expired ? "Expiré" : "Valide";
    }

    return (
        <SafeAreaViewParent>
            <KeyboardAwareScrollView>
                {/* Images */}
                <View style={[styles.addProductInputContainer, { paddingVertical: 20, marginTop: 20 }]}>
                    {product.images.length === 0 && (
                        <TouchableOpacity disabled={!editable} onPress={() => setModal("photo")} style={{ display: "flex", alignItems: "center", marginVertical: 20 }}>
                            <Image source={require("../../assets/images/image_upload.png")} style={{ width: 220, height: 209.1 }} />
                        </TouchableOpacity>
                    )}

                    {product.images.length > 0 && (
                        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 15 }}>
                            {product.images.map((image, index) => (
                                <View key={index} style={{ width: "33.3%", aspectRatio: 1, padding: 5, position: "relative" }}>
                                    {editable && (
                                        <TouchableOpacity
                                            onPress={() => handleDeletePhoto(image)}
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
                                    )}
                                    <Image
                                        source={{
                                            uri: image.contentUrl ? API_URL + image.contentUrl : "data:image/png;base64," + image.base64
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            resizeMode: "cover"
                                        }}
                                    />
                                </View>
                            ))}
                            {product.images.length < 5 && editable && (
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
                        editable={editable}
                        style={styles.addProductInput}
                        placeholder="Choisissez le nom du produit"
                        placeholderTextColor={colors.gray2}
                        value={product.title}
                        onChangeText={(title) => setProduct({ ...product, title })}
                    />
                </View>

                {editable && (
                    <>
                        <TouchableOpacity onPress={() => setModal("brand")} style={[styles.addProductInputContainer, styles.positionRelative]}>
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
                            style={[styles.addProductInputContainer, styles.positionRelative, !product.brand && { opacity: 0.4 }]}>
                            <Text style={styles.addProductLabel}>Catégorie</Text>
                            <Text style={[styles.addProductInput, { color: product.category ? colors.darkBlue : colors.gray2 }]}>
                                {product.category ? product.category : "Sélectionnez une catégorie"}
                            </Text>
                            <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                        </TouchableOpacity>

                        {/* Material */}
                        <TouchableOpacity onPress={() => setModal("material")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                            <Text style={styles.addProductLabel}>Matériel</Text>
                            <Text style={[styles.addProductInput, { color: product.material ? colors.darkBlue : colors.gray2 }]}>
                                {product.material ? product.material.name : "Sélectionnez un matériel"}
                            </Text>
                            <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                        </TouchableOpacity>

                        {/* Size */}
                        <TouchableOpacity onPress={() => setModal("size")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                            <Text style={styles.addProductLabel}>Taille</Text>
                            <Text style={[styles.addProductInput, { color: product.size ? colors.darkBlue : colors.gray2 }]}>
                                {product.size ? product.size.name : "Renseignez la taille de l'article"}
                            </Text>
                            <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                        </TouchableOpacity>
                        {/* State */}
                        <TouchableOpacity onPress={() => setModal("state")} style={[styles.addProductInputContainer, styles.positionRelative]}>
                            <Text style={styles.addProductLabel}>Etat</Text>
                            <Text style={[styles.addProductInput, { color: product.state ? colors.darkBlue : colors.gray2 }]}>
                                {product.state ? product.state.name : "Indiquez l'état de l'article"}
                            </Text>
                            <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                        </TouchableOpacity>

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
                                setModal("");
                                setProduct({ ...product, material });
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
                    </>
                )}

                {!editable && (
                    <>
                        <View style={styles.addProductInputContainer}>
                            <Text style={styles.addProductLabel}>Marque</Text>
                            <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.brand.name}</Text>
                        </View>
                        <View style={styles.addProductInputContainer}>
                            <Text style={styles.addProductLabel}>Catégorie</Text>
                            <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.category}</Text>
                        </View>
                        <View style={styles.addProductInputContainer}>
                            <Text style={styles.addProductLabel}>Matériel</Text>
                            <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.material?.name || "Pas de donnée"}</Text>
                        </View>
                        <View style={styles.addProductInputContainer}>
                            <Text style={styles.addProductLabel}>Taille</Text>
                            <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.size.name}</Text>
                        </View>
                        <View style={styles.addProductInputContainer}>
                            <Text style={styles.addProductLabel}>Etat</Text>
                            <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.state.name}</Text>
                        </View>
                    </>
                )}

                {/* Description */}
                {/* {(editable || product.description) && (
                    <View style={styles.addProductInputContainer}>
                        <Text style={styles.addProductLabel}>Description</Text>
                        <TextInput
                            editable={editable}
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
                )} */}

                {/* Seller */}
                {!editable ? (
                    <View style={[styles.addProductInputContainer, { marginBottom: 10 }]}>
                        <Text style={styles.addProductLabel}>Nom du vendeur</Text>
                        <Text style={[styles.addProductInput, styles.textMediumGray]}>{product.seller.name}</Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setModal("seller")} style={[styles.addProductInputContainer, styles.positionRelative, { marginBottom: 10 }]}>
                            <Text style={styles.addProductLabel}>Nom du vendeur</Text>
                            <Text style={[styles.addProductInput, { color: product.seller ? colors.darkBlue : colors.gray2 }]}>
                                {product.seller ? product.seller.name : "Sélectionnez un vendeur"}
                            </Text>
                            <Image source={require("../../assets/images/chevron-down.png")} style={styles.chevronDown} />
                        </TouchableOpacity>

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
                    </>
                )}
                <View style={{ marginHorizontal: 20 }}>
                    <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Date de dépôt: {convertDateToDisplay(productRef.current.createAt)}</Text>
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
                            <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular, { paddingBottom: paddingBottomText }]}>Statut: {statusVoucher}</Text>
                            <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>Date de validité: {convertDateToDisplay(voucher.expirationDate)}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={[styles.font20, styles.textDarkBlue, styles.fontSofiaSemiBold, { marginVertical: Platform.OS === "ios" ? 15 : 20 }]}>
                            Informations déposant
                        </Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular, { paddingBottom: paddingBottomText }]}>
                            Prénom: {productRef.current.customer.firstname}
                        </Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular, { paddingBottom: paddingBottomText }]}>
                            Nom: {productRef.current.customer.lastname}
                        </Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular, { paddingBottom: paddingBottomText }]}>
                            Email: {productRef.current.customer.email}
                        </Text>
                        <Text style={[styles.font18, styles.textDarkBlue, styles.fontSofiaRegular]}>
                            Tel: {productRef.current.customer.phone ? productRef.current.customer.phone : "Pas des donées"}
                        </Text>
                    </View>
                </View>
                {editable ? (
                    <View style={{ marginVertical: 20 }}>
                        <TouchableOpacity
                            onPress={handleSaveModification}
                            style={[styles.greenScreen, { marginHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginVertical: 10 }]}>
                            <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>Enregistrer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleResetModification} style={[styles.buttonWithBorderGreen, { marginBottom: Platform.OS === "ios" ? 30 : 0 }]}>
                            <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>{"Annuler les\nmodifications"}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ marginVertical: 20 }}>
                        {props.route.params.btnText && (
                            <TouchableOpacity
                                onPress={() => {
                                    props.navigation.navigate("Catalog", {
                                        screen: props.route.params.screen,
                                        params: { deleteProduct: false, sellProduct: true }
                                    });
                                }}
                                style={[styles.greenScreen, { marginHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginVertical: 10 }]}>
                                <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>{props.route.params.btnText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={handleModifyProduct} style={styles.buttonWithBorderGreen}>
                            <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalConfirmation(true)}
                            style={[styles.buttonWithBorderGreen, { backgroundColor: colors.red, marginBottom: Platform.OS === "ios" ? 30 : 0 }]}>
                            <Text style={[styles.textWhite, styles.textCenter, styles.font24]}>Supprimer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loadingScreen(isLoadingScreenVisible)}
                <ModalPhoto visible={modal === "photo"} onCancel={() => setModal("")} handleTakePhoto={handleTakePhoto} handleSelectPhoto={handleSelectPhoto} />
                <ModalConfirmation
                    visible={modalConfirmation}
                    description={"Êtes-vous sûr de vouloir supprimer ce produit ?\nCela supprimera le bon d'achat associé"}
                    handleSubmit={handleDeleteProduct}
                    handleCancel={() => setModalConfirmation(false)}
                />
            </KeyboardAwareScrollView>
        </SafeAreaViewParent>
    );
};

export default ProductDetail;
