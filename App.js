/** React */
import React, { useEffect, useReducer } from "react";
import { Alert, Platform, View, Text, TouchableOpacity, Image } from "react-native";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

/** App */
import LoginPage from "./src/page/auth/LoginPage";
import HomeScreen from "./src/page/HomeScreen";
import SLSplashScreen from "./src/page/SLSplashScreen";
import { STORAGE_USER } from "./src/lib/constants";
import PasswordForgotten from "./src/page/auth/PasswordForgotten";
import { AuthContext, authReducer, authInitalState } from "./src/lib/AuthContext.js";
import ListCustomers from "./src/page/customer/ListCustomers";
import CustomerDetail from "./src/page/customer/CustomerDetail";
import styles from "./src/assets/css/styles";
import BottomBarMenu from "./src/components/BottomBarMenu";
import MenuHelper from "./src/components/MenuHelper";
import ModifyCustomer from "./src/page/customer/ModifyCustomer";
import ActifVouchers from "./src/page/customer/voucher/ActifVouchers";
import InactifVouchers from "./src/page/customer/voucher/InactifVouchers";
import MyAccount from "./src/page/profil/MyAccount";
import NewCustomer from "./src/page/newProduct/NewCustomer";
import CustomerDetailProduct from "./src/page/newProduct/CustomerDetailProduct";
import FormProduct from "./src/page/newProduct/FormProduct";

const RootStack = createStackNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
                Alert.alert("Erreur système", "Votre session a expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: () => authContext.signOut() }]);
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
                    Alert.alert("Erreur système", "Veuillez-vous réessayer!");
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
            if (title === "Nouveau Lifer") {
                return (
                    <TouchableOpacity onPress={navigation.goBack} style={{ position: "absolute", top: 20, left: 20 }}>
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
                {title === "Bons d'achat" && (
                    <TouchableOpacity onPress={() => navigation.navigate("Customer", { screen: "InactifVouchers" })} style={styles.historyImageBtn}>
                        <Image source={require("./src/assets/images/history.png")} style={styles.historyImage} />
                    </TouchableOpacity>
                )}
                {hasBackBtn && !scene.descriptor.options.title && backButton()}
                <Text style={styles.headerTitle}>{titleScreen}</Text>
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
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Clients", false) }} name="ListCustomers" component={ListCustomers} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Informations client") }} name="CustomerDetail" component={CustomerDetail} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Modifier les informations") }} name="ModifyCustomer" component={ModifyCustomer} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Bons d'achat", false) }} name="ActifVouchers" component={ActifVouchers} />
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Historique") }} name="InactifVouchers" component={InactifVouchers} />
        </Stack.Navigator>
    );

    const scannerScreen = () => {
        return <Text>Scanner</Text>;
    };

    const catalogScreen = () => {
        return <Text>Catalog</Text>;
    };

    const voucherScreen = () => {
        return <Text>Voucher</Text>;
    };

    const profilScreen = () => (
        <Stack.Navigator initialRouteName="MyAccount">
            <Stack.Screen options={{ header: (screenObject) => headerSL(screenObject, "Compte", false, false) }} name="MyAccount" component={MyAccount} />
        </Stack.Navigator>
    );

    const newProductScreen = () => (
        <Stack.Navigator>
            <Stack.Screen name="NewCustomer" options={{ header: (screenObject) => headerSL(screenObject, "Nouveau Lifer") }} component={NewCustomer} />
            <Stack.Screen name="ListCustomersAddProduct" options={{ header: (screenObject) => headerSL(screenObject, "Trouver un client", false) }} component={ListCustomers} />
            <Stack.Screen name="CustomerDetailProduct" options={{ header: (screenObject) => headerSL(screenObject, "Inforrmtations client") }} component={CustomerDetailProduct} />
            <Stack.Screen name="AddProduct" options={{ header: (screenObject) => headerSL(screenObject, "Ajouter un produit", false) }} component={FormProduct} />
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
        <AuthContext.Provider value={{ user: state.user, fromLogin: state.fromLogin, ...authContext }}>
            <NavigationContainer>
                {state.user.token ? (
                    <>
                        <RootStack.Navigator
                            modal="modal"
                            screenOptions={{
                                headerShown: false,
                                cardStyle: { backgroundColor: "transparent" },
                                cardOverlayEnabled: true,
                                cardStyleInterpolator: ({ current: { progress } }) => ({
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
                                })
                            }}>
                            <RootStack.Screen name="MainScreen" component={mainScreen} />
                            <RootStack.Screen name="MenuHelper" component={MenuHelper} />
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
