/** React */
import React, { useEffect, useState } from "react";
import { View, ImageBackground, Alert, Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** App */
import LoginPage from "./src/page/LoginPage";
import MainPage from "./src/page/MainPage";
import LaunchScreen from "./src/page/LaunchScreen";
import { colors } from "./src/assets/colors";
import { STORAGE_KEY, STORAGE_USER } from "./src/lib/constants";
import { toUppercaseKeys, getListCustomers, getListProducts } from "./src/lib/Helpers";
import FetchService from "./src/lib/FetchService";

const initialState = {
	showLaunchScreen: true,
	isLogin: false,
	token: null,
	listCustomers: {
		customers: [],
		listLastNames: [],
		listFirstNames: [],
		listEmails: []
	},
	brands: [],
	listProducts: {
		sold: [],
		haventsold: []
	}
};

const App = () => {
	const [data, setData] = useState(initialState);
	useEffect(() => {
		const getData = async () => {
			try {
				const oldToken = await getToken();
				if (oldToken !== null) {
					const { brands, token } = await getListBrands(oldToken);
					const { customers, listLastNames, listFirstNames, listEmails } = await getListCustomers(oldToken);
					const { sold, haventsold } = await getListProducts(oldToken);
					setData({
						showLaunchScreen: false,
						isLogin: true,
						token,
						listCustomers: { customers, listLastNames, listFirstNames, listEmails },
						brands,
						listProducts: { sold, haventsold }
					});
				} else {
					setData({
						...data,
						showLaunchScreen: false
					});
				}
			} catch (error) {
				console.debug("get data", error);
				if (error === "Not allowed to use this Resource") {
					Alert.alert("Erreur système", "Votre session à expirée, veuillez-vous re-connecter.", [
						{ text: "Se déconnecter", onPress: () => handleLogout() }
					]);
				} else {
					Alert.alert("Erreur système", "SecondLife rencontre une erreur, veuillez-vous re-connecter.", [
						{ text: "Se déconnecter", onPress: () => handleLogout() }
					]);
				}
			}
		};
		getData();
		if (Platform.OS === "ios") {
			SplashScreen.hide();
		}
	}, []);

	/** Get Token from storage */
	const getToken = async () => {
		try {
			const value = await AsyncStorage.getItem(STORAGE_KEY);
			if (value !== null) {
				return value;
			} else {
				return null;
			}
		} catch (error) {
			console.debug("reading token error");
			Alert.alert("Erreur système", "Votre session à expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: () => handleLogout() }]);
		}
	};

	/** Get list brands
	 * if we detecte refresh token in header, we renew token
	 */
	const getListBrands = async token => {
		let newToken = token;
		const brands = await FetchService.get("brands", token);
		
		// token will expire, update the token
		if (brands.refreshToken) {
			try {
				const user = AsyncStorage.getItem(STORAGE_USER);
				const userData = JSON.parse(user);
				const { username, password } = userData;
				const response = await FetchService.login(username, password);
				if (response && response.token) {
					await AsyncStorage.setItem(STORAGE_KEY, response.token);
					newToken = response.token;
				}
			} catch (error) {
				console.debug(error);
			}
		}

		const listBrands = [];
		if (brands.data.length > 0) {
			brands.data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
			brands.data.forEach(brand => {
				const newBrand = toUppercaseKeys(brand);
				listBrands.push(newBrand);
			});
		}
		return {
			token: newToken,
			brands: listBrands,
		};
	};

	const handleLogin = async (token, data) => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, token);
			await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(data));
			const { brands } = await getListBrands(token);
			const { customers, listLastNames, listFirstNames, listEmails } = await getListCustomers(token);
			const { sold, haventsold } = await getListProducts(token);
			setData({
				showLaunchScreen: false,
				isLogin: true,
				token,
				listCustomers: { customers, listLastNames, listFirstNames, listEmails },
				brands,
				listProducts: { sold, haventsold }
			});
		} catch (error) {
			console.debug("save token error", error);
			Alert.alert("Erreur système", "Veuillez-vous réessayer!");
		}
	};

	const handleLogout = async () => {
		try {
			await AsyncStorage.removeItem(STORAGE_KEY);
			await AsyncStorage.removeItem(STORAGE_USER);
			setData({ ...initialState, showLaunchScreen: false });
		} catch (error) {
			console.debug("remove token error");
			setData(initialState);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.white }}>
			<ImageBackground
				source={require("./src/assets/images/background.png")}
				style={{ flex: 1 }}
				imageStyle={{
					resizeMode: "stretch"
				}}>
				{data.showLaunchScreen ? (
					<LaunchScreen />
				) : data.isLogin ? (
					<MainPage
						handleLogout={handleLogout}
						token={data.token}
						brands={data.brands}
						listCustomers={data.listCustomers}
						listProducts={data.listProducts}
					/>
				) : (
					<LoginPage handleLogin={handleLogin} />
				)}
			</ImageBackground>
		</View>
	);
};

export default App;
