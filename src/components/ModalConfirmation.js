/** React */
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

/** App */
import { colors } from "../assets/colors";
import CustomModal from "./CustomModal";

const ModalConfirmation = props => (
	<CustomModal
		visible={props.visible}
		containerViewStyle={{
			width: 320,
			borderRadius: 10,
			paddingVertical: 20,
			paddingHorizontal: 10
		}}
		rootViewStyle={{ backgroundColor: "rgba(0,0,0, 0.8)" }}>
		<View>
			<Text
				style={{
					fontWeight: "bold",
					fontSize: 16,
					textAlign: "center"
				}}>
				{`Êtes-vous sûr de vouloir marquer\ncet article comme vendu ?`}
			</Text>
		</View>
		<View
			style={{
				marginTop: 20,
				width: "100%",
				flexDirection: "row",
				paddingHorizontal: 10
			}}>
			<TouchableOpacity style={{ flex: 1, backgroundColor: colors.black, marginRight: 20 }} onPress={props.handleSubmit}>
				<Text
					style={{
						color: colors.white,
						textAlign: "center",
						paddingVertical: 10,
						fontSize: 16,
						fontWeight: "bold"
					}}>
					Oui
				</Text>
			</TouchableOpacity>
			<TouchableOpacity style={{ flex: 1, backgroundColor: colors.black, marginLeft: 20 }} onPress={props.handleCancel}>
				<Text
					style={{
						color: colors.white,
						textAlign: "center",
						paddingVertical: 10,
						fontSize: 16,
						fontWeight: "bold"
					}}>
					Non
				</Text>
			</TouchableOpacity>
		</View>
	</CustomModal>
);

export default ModalConfirmation;
