/** React */
import React, { useEffect, useState } from "react";
import { Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** App */
import Form from './Form';
import CameraScan from './CameraScan';
import ListProducts from './ListProducts';
import {colors} from '../lib/colors';
import Profile from './Profile';
import { getListCustomers, getListProducts } from "../lib/Helpers";

const MainPage = props => {
	const [productAdded, setProductAdded] = useState(null);
	const [productModified, setProductModified] = useState(null);
	const [referenceScanned, setReferenceScanned] = useState(null);
	const [pageShowed, setPageShowed] = useState("addProduct");
	const [listProducts, setListProducts] = useState(props.listProducts);
	const [listCustomers, setListCustomers] = useState(props.listCustomers);

	/** get list products when we add one product (for getting the uri of new product) */
	useEffect(() => {
		if (productAdded !== null) {
			updateData();
			setProductAdded(null);
		}
	}, [productAdded]);

	const updateData = async () => {
		try {
			const { customers, listLastNames, listFirstNames, listEmails } = await getListCustomers(props.token);
			const { sold, haventsold } = await getListProducts(props.token);
			setListProducts({ sold, haventsold });
			setListCustomers({ customers, listLastNames, listFirstNames, listEmails });
		} catch (error) {
			console.debug("update data error", error);
			Alert.alert("Erreur système", "SecondLife ne peut pas mettre à jour des données");
		}
	};

	/** Update list products when we click the button vendu or button à vendre */
	const updateListProducts = (uri, target) => {
		let newProductsSold = [];
		let newProductsHaventSold = [];
		if (target === "sold") {
			newProductsSold = [...listProducts.sold];
			listProducts.haventsold.forEach(product => {
				if (product.uri === uri) {
					newProductsSold.push({
						...product,
						product: {
							...product.product,
							sold: true
						}
					});
				} else {
					newProductsHaventSold.push(product);
				}
			});
		} else {
			newProductsHaventSold = [...listProducts.haventsold];
			listProducts.sold.forEach(product => {
				if (product.uri === uri) {
					newProductsHaventSold.push({
						...product,
						product: {
							...product.product,
							sold: false
						}
					});
				} else {
					newProductsSold.push(product);
				}
			});
		}
		setListProducts({
			sold: newProductsSold,
			haventsold: newProductsHaventSold
		});
	};

	const handleModifyProduct = product => {
		setProductModified(product);
		setPageShowed("addProduct");
	};

	const handleCancelModification = () => {
		setPageShowed("listProducts");
	};

	const handleSaveModification = productModified => {
		const newProductsHaventSold = [...listProducts.haventsold];
		newProductsHaventSold.forEach((product, index) => {
			if (product.uri === productModified.uri) {
				newProductsHaventSold[index] = { ...productModified };
			}
		});
		setListProducts({
			...listProducts,
			haventsold: newProductsHaventSold
		});
		setProductModified(productModified);
		setPageShowed("listProducts");
	};

	const renderPage = () => {
		switch (pageShowed) {
			case "addProduct":
				return (
					<Animated.View style={{ width: "100%" }}>
						<Form
							listCustomers={listCustomers}
							brands={props.brands}
							productModified={productModified}
							handleSaveModification={productModified => handleSaveModification(productModified)}
							handleCancelModification={handleCancelModification}
							handleAddProduct={product => setProductAdded(product)}
							token={props.token}
						/>
					</Animated.View>
				);
			case "scan":
				return (
					<Animated.View>
						<CameraScan
							token={props.token}
							handleGetReferenceScanned={reference => {
								setReferenceScanned(reference);
								setPageShowed("listProducts");
							}}
						/>
					</Animated.View>
				);
			case "listProducts":
				return (
					<Animated.View>
						<ListProducts
							listProductsSold={listProducts.sold}
							listProductsHaventSold={listProducts.haventsold}
							productModified={productModified}
							updateListProducts={updateListProducts}
							referenceScanned={referenceScanned}
							resetReferenceScanned={() => setReferenceScanned(null)}
							handleModifyProduct={handleModifyProduct}
							token={props.token}
						/>
					</Animated.View>
				);
			case "profile":
				return (
					<Animated.View>
						<Profile handleLogout={props.handleLogout} />
					</Animated.View>
				);
			default:
				return;
		}
	};

	return (
		<View style={styles.container}>
			{renderPage()}
			<View style={styles.bottomBar}>
				<TouchableOpacity
					style={styles.bottomBarItem}
					onPress={() => {
						setPageShowed("addProduct");
						setProductModified(null);
					}}
					disabled={pageShowed === "addProduct"}>
					<Image
						source={pageShowed === "addProduct" ? require("../assets/images/btn-add-active.png") : require("../assets/images/btn-add.png")}
						style={{ width: 24, height: 24 }}
					/>
					<Text
						style={{
							color: pageShowed === "addProduct" ? colors.black : colors.gray
						}}>
						Ajouter
					</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.bottomBarItem} onPress={() => setPageShowed("scan")} disabled={pageShowed === "scan"}>
					<Image
						source={pageShowed === "scan" ? require("../assets/images/btn-scan-active.png") : require("../assets/images/btn-scan.png")}
						style={{ width: 24, height: 24 }}
					/>
					<Text
						style={{
							color: pageShowed === "scan" ? colors.black : colors.gray
						}}>
						Scanner
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.bottomBarItem}
					onPress={() => {
						setPageShowed("listProducts");
						setProductModified(null);
					}}
					disabled={pageShowed === "listProducts"}>
					<Image
						source={pageShowed === "listProducts" ? require("../assets/images/btn-list-active.png") : require("../assets/images/btn-list.png")}
						style={{ width: 24, height: 24 }}
					/>
					<Text
						style={{
							color: pageShowed === "listProducts" ? colors.black : colors.gray
						}}>
						Catalogue
					</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.bottomBarItem} onPress={() => setPageShowed("profile")} disabled={pageShowed === "profile"}>
					<Image
						source={pageShowed === "profile" ? require("../assets/images/btn-profile-active.png") : require("../assets/images/btn-profile.png")}
						style={{ width: 24, height: 24 }}
					/>
					<Text
						style={{
							color: pageShowed === "profile" ? colors.black : colors.gray
						}}>
						Profil
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		height: "100%"
	},
	btn: {
		width: 300,
		paddingVertical: 20,
		backgroundColor: colors.black
	},
	btnText: {
		fontSize: 20,
		textAlign: "center",
		textTransform: "uppercase",
		color: colors.white,
		fontWeight: "bold"
	},
	bottomBar: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		height: 60,
		zIndex: 99999,
		// shadowRadius: -2,
		borderRadius: 2,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 2,
		shadowColor: colors.black,
		elevation: 5,
		display: "flex",
		flexDirection: "row",
		backgroundColor: colors.white,
		paddingVertical: 5
	},
	bottomBarItem: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center"
	}
});

export default MainPage;
