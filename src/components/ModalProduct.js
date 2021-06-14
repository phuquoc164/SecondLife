/** React */
import React, { useState } from "react";
import { Image, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

/** App */
import {colors} from '../lib/colors';
import ModalConfirmation from "./ModalConfirmation";

const ModalProduct = props => {
	const { product, visible } = props;
	const [modalConfirmation, setModalConfirmation] = useState(false);

	if (!product) {
		return <></>;
	}

	const nbImages = product.product.pictures.length;
	return (
		<Modal transparent={true} animationType="slide" visible={visible} style={{ position: "relative" }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
				<ScrollView style={{ flex: 1, padding: 20 }}>
					<TouchableOpacity
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 10
						}}
						onPress={props.goBack}>
						<Image source={require("../assets/images/back.png")} style={{ width: 17.25, height: 17 }} />
						<Text style={{ fontWeight: "bold", marginLeft: 10 }}>Retour</Text>
					</TouchableOpacity>
					<ScrollView
						horizontal={true}
						contentContainerStyle={{ width: `${100 * (nbImages <= 3 ? 1 : 2)}%` }}
						showsHorizontalScrollIndicator={false}
						scrollEventThrottle={200}
						decelerationRate="fast">
						{product.product.pictures.map(picture => (
							<View
								key={picture.name}
								style={{
									width: `${100 / nbImages}%`,
									maxWidth: "50%",
									aspectRatio: 1,
									padding: 5
								}}>
								<Image
									source={{
										uri: "data:image/png;base64," + picture.content
									}}
									style={{ width: "100%", height: "100%", resizeMode: "cover" }}
								/>
							</View>
						))}
					</ScrollView>
					<View style={{ padding: 20, marginBottom: 0 }}>
						<Text style={{ fontSize: 15, color: "#AAAAAA", fontWeight: "bold" }}>
							{product.customer.firstName} {product.customer.lastName}
						</Text>
						<Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "bold" }}>{product.product.title}</Text>
						<Text style={{ fontWeight: "bold" }}>Information Générale</Text>
						<View style={{ marginBottom: 25 }}>
							<Text>{`Prénom: ${product.customer.firstName}`}</Text>
							<Text>{`Nom: ${product.customer.lastName}`}</Text>
							<Text>{`Email: ${product.customer.email}`}</Text>
							<Text>{`Tél: ${product.customer.phone}`}</Text>
						</View>
						<Text style={{ fontWeight: "bold" }}>Article</Text>
						<View>
							<Text>{`Réf: ${product.sku}`}</Text>
							<Text>{`Nom: ${product.product.title}`}</Text>
							<Text>{`Marque: ${product.product.brand}`}</Text>
							<Text>{`Prix: ${product.product.price} €`}</Text>
							<Text>{`Créé: ${product.product.createdDate.split(" ")[0]}`}</Text>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
			{product.product.sold ? (
				<View
					style={{
						position: "absolute",
						bottom: 10,
						right: 10,
						margin: 10
					}}>
					<TouchableOpacity
						onPress={props.handleUnsellProduct}
						style={{
							backgroundColor: colors.black,
							paddingVertical: 10,
							paddingHorizontal: 30
						}}>
						<Text style={{ color: colors.white, textAlign: "center", fontSize: 17 }}>Marqué à vendre</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View
					style={{
						position: "absolute",
						width: "100%",
						bottom: 10,
						flexDirection: "row"
					}}>
					<TouchableOpacity
						onPress={() => setModalConfirmation(true)}
						style={{
							backgroundColor: colors.black,
							flex: 1,
							padding: 10,
							marginLeft: 10,
							marginRight: 5
						}}>
						<Text style={{ color: colors.white, textAlign: "center", fontSize: 17 }}>Marqué vendu</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={props.handleModifyProduct}
						style={{
							backgroundColor: colors.black,
							flex: 1,
							padding: 10,
							marginLeft: 5,
							marginRight: 10
						}}>
						<Text style={{ color: colors.white, textAlign: "center", fontSize: 17 }}>Modifier l'article</Text>
					</TouchableOpacity>
				</View>
			)}
			{!product.product.sold && (
				<ModalConfirmation
					visible={modalConfirmation}
					handleSubmit={() => {
						props.handleSellProduct();
						setModalConfirmation(false);
					}}
					handleCancel={() => setModalConfirmation(false)}
				/>
			)}
		</Modal>
	);
};

export default ModalProduct;
