/** React */
import React from "react";
import { Animated, Text, View } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

/** App */
import { colors } from "../lib/colors";

let row = [];
let prevOpenedRow;

const SwipeableComponent = props => {
	const renderAction = (text, color, x, progress, onPress) => {
		const trans = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [x, 0]
		});
		return (
			<Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
				<RectButton
					style={{
						backgroundColor: color,
						alignItems: "center",
						flex: 1,
						justifyContent: "center"
					}}
					onPress={() => {
						prevOpenedRow.close();
						prevOpenedRow = null;
						onPress();
					}}>
					<Text
						style={{
							color: "white",
							fontSize: 15,
							backgroundColor: "transparent",
							padding: 5,
							textAlign: "center"
						}}>
						{text}
					</Text>
				</RectButton>
			</Animated.View>
		);
	};

	const renderActions = progress => (
		<View
			style={{
				width: props.type === "sold" ? 80 : 160,
				height: 80,
				flexDirection: "row"
			}}>
			{props.type === "sold" ? (
				renderAction("Marqué\nà vendre", colors.black, 80, progress, () => props.handleUnsellProduct(props.data))
			) : (
				<>
					{renderAction("Marqué\nVendu", colors.green, 160, progress, () => props.handleSellProduct(props.data))}
					{renderAction("Modifier\nl'article", colors.black, 80, progress, () => props.handleModifyProduct(props.data))}
				</>
			)}
		</View>
	);

	return (
		<Swipeable
			ref={ref => (row[props.index] = ref)}
			friction={2}
			leftThreshold={30}
			renderRightActions={renderActions}
			onSwipeableWillOpen={() => {
				if (prevOpenedRow && prevOpenedRow !== row[props.index]) {
					prevOpenedRow.close();
				}
				prevOpenedRow = row[props.index];
			}}>
			{props.children}
		</Swipeable>
	);
};

export default SwipeableComponent;
