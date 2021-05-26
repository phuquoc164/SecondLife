/** React */
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ResultPage = props => {
	let className = "imageCheck";
	let icon = require("../assets/images/check.png");
	if (!props.isSuccess) {
		icon = require("../assets/images/cross.png");
		className = "imageCross";
	}
	return (
		<View style={styles.mainScreen}>
			<View style={{ paddingHorizontal: 35 }}>
				<Text style={styles.title}>{props.title}</Text>
				<View style={{ width: "100%", alignSelf: "center" }}>
					<Image source={icon} style={styles[className]} />
				</View>
			</View>
			{props.btnComponent && props.btnComponent()}
		</View>
	);
};

const styles = StyleSheet.create({
	mainScreen: {
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
		position: "relative"
	},
	title: {
		fontSize: 25,
		textAlign: "center"
	},
	imageCross: {
		width: 90,
		height: 90
	},
	imageCheck: {
		width: 120,
		height: 100
	}
});

export default ResultPage;
