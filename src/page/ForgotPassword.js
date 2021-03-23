/** React */
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/** App */
import { colors } from "../assets/colors";
import FetchService from "../lib/FetchService";
import { validateEmail } from "../lib/Helpers";

const ForgotPassword = props => {
	const [email, setEmail] = useState({
		value: "",
		error: false
	});
	const [showIconValidate, setShowIconValidate] = useState(null);

	const handleSendData = () => {
		if (!validateEmail(email.value)) {
			setEmail({ ...email, error: true });
			return;
		}
		FetchService.post("reset-password", { email })
			.then(response => {
				setShowIconValidate(response.success ? "valid" : "unvalid");
				setTimeout(() => {
					props.handleSendLinkReset();
				}, 2000);
			})
			.catch(error => {
				console.debug(error);
				setShowIconValidate("unvalid");
				setTimeout(() => {
					props.handleSendLinkReset();
				}, 2000);
			});
	};

	return (
		<View style={styles.mainScreen}>
			<View style={{ flex: 1, width: "60%" }}>
				<Image
					source={require("../assets/images/logo.png")}
					style={{
						flex: 1,
						width: "100%",
						maxWidth: 300,
						resizeMode: "contain"
					}}
				/>
			</View>

			<View
				style={{
					flex: 2,
					width: "100%",
					flexDirection: "column",
					justifyContent: "space-between"
				}}>
				<View style={{ flex: 1 }}>
					<Text style={styles.title}>Mot de passe oublié</Text>
					<Text style={styles.subTitle}>
						Saissisez l'adresse mail de votre compte THUNDERSTONE. Nous allons envoyer à cette adresse un lien vous permettant de réinitialiser
						facilement votre mot de passe.
					</Text>
				</View>
				<View style={{ width: "100%", flex: 1, marginVertical: 50 }}>
					<Text style={{ textTransform: "uppercase", marginBottom: 5, fontSize: 17, fontWeight: "bold" }}>E-mail</Text>
					<View style={{ position: "relative" }}>
						<TextInput
							style={styles.input}
							name="email"
							autoCompleteType="email"
							keyboardType="email-address"
							autoCapitalize="none"
							value={email.value}
							onChangeText={value => {
								const error = value !== "" && email.error ? false : email.error;
								setEmail({ error, value });
							}}
						/>
						{email.error && <Image source={require("../assets/images/error.png")} style={styles.iconError} />}
					</View>
				</View>
				<View style={{ flex: 1, alignSelf: "center" }}>
					<TouchableOpacity style={styles.button} onPress={handleSendData}>
						<Text style={styles.buttonText}>Valider</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				{showIconValidate && showIconValidate === "valid" && <Image source={require("../assets/images/check.png")} style={styles.iconCheck} />}
				{showIconValidate && showIconValidate === "unvalid" && (
					<Image source={require("../assets/images/cross.png")} style={{ width: 90, height: 90 }} />
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	mainScreen: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 45,
		paddingVertical: 20
	},
	title: {
		fontWeight: "bold",
		fontSize: 18,
		textTransform: "uppercase",
		marginBottom: 10
	},
	subTitle: {
		textAlign: "justify",
		fontSize: 14
	},
	input: {
		height: 40,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderColor: colors.gray,
		borderWidth: 2,
		backgroundColor: colors.white
	},
	button: {
		paddingVertical: 10,
		backgroundColor: colors.black,
		borderRadius: 5,
		borderWidth: 1,
		width: 200
	},
	buttonText: {
		color: colors.white,
		fontSize: 25,
		fontWeight: "bold",
		textAlign: "center"
	},
	iconError: {
		position: "absolute",
		right: 3,
		bottom: 2.5,
		width: 25,
		height: 25
	},
	iconCheck: {
		width: 120,
		height: 100
	}
});

export default ForgotPassword;
