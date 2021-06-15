/** React */
import React, { useEffect, useReducer } from "react";
import { Alert, Platform, View, Text, TouchableOpacity, Image } from "react-native";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

/** App */
import LoginPage from "./src/page/auth/LoginPage";
import HomeScreen from "./src/page/HomeScreen";
import SLSplashScreen from "./src/page/SLSplashScreen";
import { STORAGE_USER, TITLE } from "./src/lib/constants";
import PasswordForgotten from "./src/page/auth/PasswordForgotten";
import { AuthContext, authReducer, authInitalState } from "./src/lib/AuthContext.js";
import ListCustomers from "./src/page/customer/ListCustomers";
import CustomerDetail from "./src/page/customer/CustomerDetail";
import styles from "./src/assets/css/styles";
import BottomBarMenu from "./src/components/BottomBarMenu";
import MenuHelper from "./src/components/MenuHelper";
import ModifyCustomer from "./src/page/customer/ModifyCustomer";
import MyAccount from "./src/page/profil/MyAccount";
import NewCustomer from "./src/page/newProduct/NewCustomer";
import CustomerDetailProduct from "./src/page/newProduct/CustomerDetailProduct";
import AddProduct from "./src/page/newProduct/AddProduct";
import ActifVouchers from "./src/page/voucher/ActifVouchers";
import InactifVouchers from "./src/page/voucher/InactifVouchers";
import MenuChangeCatalog from "./src/page/catalog/MenuChangeCatalog";
import OnceAgain from "./src/page/catalog/OnceAgain";
import Rayon from "./src/page/catalog/Rayon";
import Donation from "./src/page/catalog/Donation";
import ResultPage from "./src/page/newProduct/ResultPage";
import ProductDetail from "./src/page/catalog/ProductDetail";
import ScannerScreen from './src/page/ScannerScreen';
import NeedHelp from './src/page/profil/NeedHelp';

const RootStack = createStackNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SPECIAL_TITLES = ["Informations produit", "Informations client"];
const App = () => {
    const [state, dispatch] = useReducer(authReducer, authInitalState);

    useEffect(() => {
        // Fetch the user data from storage then navigate to our appropriate place
        const getUserAsync = async () => {
            let user;

            try {
                const userJson = await AsyncStorage.getItem(STORAGE_USER);
                user = JSON.parse(userJson);
            } catch (error) {
                console.error("reading user data error", error);
                Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: () => authContext.signOut() }]);
            }

            dispatch({ type: "RESTORE_USER", user });
        };

        getUserAsync();

        if (Platform.OS === "ios") {
            SplashScreen.hide();
        }
    }, []);

    const authContext = React.useMemo(
        () => ({
            signIn: async (user) => {
                try {
                    const userJson = JSON.stringify(user);
                    await AsyncStorage.setItem(STORAGE_USER, userJson);
                    dispatch({ type: "SIGN_IN", user });
                } catch (error) {
                    console.error("save user data error", error);
                    Alert.alert("Erreur système", "Veuillez réessayer ultérieurement !");
                }
            },
            signOut: async () => {
                try {
                    await AsyncStorage.removeItem(STORAGE_USER);
                    dispatch({ type: "SIGN_OUT" });
                } catch (error) {
                    console.error("remove token error");
                }
            }
        }),
        []
    );

    if (state.isLoading) {
        return <SLSplashScreen />;
    }

    const headerSL = (screenObject, title, hasBackBtn = true, hasInfoBtn = true) => {
        const { navigation, scene } = screenObject;
        const titleScreen = scene.descriptor.options.title ? scene.descriptor.options.title : title;
        const backButton = () => {
            if (title === TITLE.products[0]) {
                return (
                    <TouchableOpacity onPress={navigation.goBack} style={{ position: "absolute", top: 27, left: 20, zIndex: 1 }}>
                        <Image source={require("./src/assets/images/arrow-right.png")} style={{ width: 35, height: 21 }} />
                    </TouchableOpacity>
                );
            }

            return (
                <TouchableOpacity onPress={navigation.goBack} style={styles.backImageBtn}>
                    <Image source={require("./src/assets/images/back_btn.png")} style={styles.backImage} />
                </TouchableOpacity>
            );
        };
        return (
            <View style={styles.header}>
                {title === TITLE.voucher[0] && (
                    <TouchableOpacity onPress={() => navigation.navigate("Voucher", { screen: "InactifVouchers" })} style={styles.historyImageBtn}>
                        <Image source={require("./src/assets/images/history.png")} style={styles.historyImage} />
                    </TouchableOpacity>
                )}
                {hasBackBtn && (!scene.descriptor.options.title || SPECIAL_TITLES.includes(scene.descriptor.options.title)) && backButton()}

                {/* Back button special for catalog page */}
                {scene.descriptor.options.handleGoBack && (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.setOptions({handleGoBack: null});
                            scene.descriptor.options.handleGoBack();
                        }}
                        style={styles.backImageBtn}>
                        <Image source={require("./src/assets/images/back_btn.png")} style={styles.backImage} />
                    </TouchableOpacity>
                )}

                {TITLE.catalog.includes(title) ? (
                    <TouchableOpacity onPress={() => navigation.navigate("MenuChangeCatalog", { title })}>
                        <Text style={styles.headerTitle}>{title}</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.headerTitle}>{titleScreen}</Text>
                )}
                {hasInfoBtn && (
                    <TouchableOpacity onPress={() => navigation.navigate("MenuHelper")} style={styles.infoImageBtn}>
                        <Image source={require("./src/assets/images/info.png")} style={styles.infoImage} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const customerScreen = () => (
        <Stack.Navigator initialRouteName="ListCustomers">
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.clients[0], false) }} name="ListCustomers" component={ListCustomers} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.clients[1]) }} name="CustomerDetail" component={CustomerDetail} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.clients[2]) }} name="ModifyCustomer" component={ModifyCustomer} />
        </Stack.Navigator>
    );

    const scannerScreen = () => (
        <Stack.Navigator>
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Scanner le code QR", false, false) }} name="ScannerScreen" component={ScannerScreen} />
        </Stack.Navigator>
    );

    const catalogScreen = () => (
        <Stack.Navigator>
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.catalog[0], false) }} name="OnceAgain" component={OnceAgain} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.catalog[1], false) }} name="Rayon" component={Rayon} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.catalog[2], false) }} name="Donation" component={Donation} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Informations produit") }} name="ProductDetail" component={ProductDetail} />
        </Stack.Navigator>
    );

    const voucherScreen = () => (
        <Stack.Navigator>
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.voucher[0], false) }} name="ActifVouchers" component={ActifVouchers} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.voucher[1]) }} name="InactifVouchers" component={InactifVouchers} />
        </Stack.Navigator>
    );

    const profilScreen = () => (
        <Stack.Navigator initialRouteName="MyAccount">
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, TITLE.profil[0], false, false) }} name="MyAccount" component={MyAccount} />
            <Stack.Screen options={{ headerShown: false }} name="NeedHelp" component={NeedHelp} />
        </Stack.Navigator>
    );

    const newProductScreen = () => (
        <Stack.Navigator>
            <Stack.Screen name="NewCustomer" options={{ header: (screenObject) => headerSL(screenObject, TITLE.products[0]) }} component={NewCustomer} />
            <Stack.Screen name="ListCustomersAddProduct" options={{ header: (screenObject) => headerSL(screenObject, TITLE.products[1], false) }} component={ListCustomers} />
            <Stack.Screen name="CustomerDetailProduct" options={{ header: (screenObject) => headerSL(screenObject, TITLE.products[2]) }} component={CustomerDetailProduct} />
            <Stack.Screen name="AddProduct" options={{ header: (screenObject) => headerSL(screenObject, TITLE.products[3], false) }} component={AddProduct} />
            <Stack.Screen name="ResultPage" options={{ header: (screenObject) => headerSL(screenObject, TITLE.products[3], false) }} component={ResultPage} />
        </Stack.Navigator>
    );

    const mainScreen = () => (
        <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home" tabBar={(props) => <BottomBarMenu {...props} />}>
            <Tab.Screen name="Customer" component={customerScreen} />
            <Tab.Screen name="Scanner" component={scannerScreen} />
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Catalog" component={catalogScreen} />
            <Tab.Screen name="Voucher" component={voucherScreen} />
            <Tab.Screen name="NewProduct" component={newProductScreen} />
            <Tab.Screen name="Profil" component={profilScreen} />
        </Tab.Navigator>
    );

    return (
        <AuthContext.Provider value={{ user: state.user, ...authContext }}>
            <NavigationContainer>
                {state.user.token ? (
                    <>
                        <RootStack.Navigator
                            modal="modal"
                            screenOptions={(navigationProps) => ({
                                headerShown: false,
                                cardStyle: { backgroundColor: "transparent" },
                                cardOverlayEnabled: true,
                                cardStyleInterpolator: ({ current: { progress } }) => {
                                    if (navigationProps.route.name === "MenuChangeCatalog") {
                                        return {};
                                    }
                                    return {
                                        cardStyle: {
                                            opacity: progress.interpolate({
                                                inputRange: [0, 0.5, 0.9, 1],
                                                outputRange: [0, 0.25, 0.7, 1]
                                            })
                                        },
                                        overlayStyle: {
                                            opacity: progress.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 0.7],
                                                extrapolate: "clamp"
                                            })
                                        }
                                    };
                                }
                            })}>
                            <RootStack.Screen name="MainScreen" component={mainScreen} />
                            <RootStack.Screen name="MenuHelper" component={MenuHelper} />
                            <RootStack.Screen name="MenuChangeCatalog" component={MenuChangeCatalog} />
                        </RootStack.Navigator>
                    </>
                ) : (
                    <RootStack.Navigator>
                        <RootStack.Screen
                            options={{
                                headerShown: false,
                                // When logging out, a pop animation feels intuitive
                                // You can remove this if you want the default 'push' animation
                                animationTypeForReplace: state.isSignout ? "pop" : "push"
                            }}
                            name="SignIn"
                            component={LoginPage}
                        />
                        <RootStack.Screen options={{ headerShown: false }} name="PasswordForgotten" component={PasswordForgotten} />
                    </RootStack.Navigator>
                )}
            </NavigationContainer>
        </AuthContext.Provider>
    );
};

export default App;
