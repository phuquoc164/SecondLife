/** React */
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import PickerModal from "react-native-picker-modal-view";

/** App */
import { colors } from "../lib/colors";
import { categoryIcons } from "../lib/constants";

let itemsOfSecondStep = [];
const PickerCategories = props => {
	const getSelectedPicker = index => {
		const key = props.dataSelected ? props.dataSelected.split("/")[index] : null;
		return {
			Id: key,
			Name: key
		};
	};

	const [data, setData] = useState({
		selectedPicker: getSelectedPicker(0),
		dataSelected: props.dataSelected,
		items: props.items,
		step: 1
	});
	const [isSubmited, setIsSubmited] = useState(false);

	useEffect(() => {
		if (!isSubmited && props.dataSelected !== data.dataSelected) {
			setData({
				selectedPicker: getSelectedPicker(0),
				dataSelected: props.dataSelected,
				items: props.items,
				step: 1
			});
		} else if (isSubmited) {
			setIsSubmited(false);
		}
	}, [props.dataSelected]);

	useEffect(() => {
		setData({
			selectedPicker: null,
			dataSelected: props.dataSelected,
			items: props.items,
			step: 1
		});
	}, [props.items])

	const handleSelectData = item => {
		console.log(item);
		const newItems = [];
		if (data.step === 1) {
			item.children.forEach(child => {
				newItems.push({
					Id: child.name,
					Name: child.name,
					children: child.children,
					ranks: child.ranks ? child.ranks : []
				});
			});
			const selectedPicker = (data.selectedPicker && item.Name === data.selectedPicker.Name) ? getSelectedPicker(1) : { Id: null, Name: null };
			setData({
				selectedPicker: selectedPicker,
				dataSelected: item.Name,
				items: newItems,
				step: 2
			});
		} else if (data.step === 2 && item.children) {
			item.children.forEach(child => {
				newItems.push({
					Id: child.name,
					Name: child.name,
					ranks: child.ranks ? child.ranks : []
				});
			});
			// get the data of second step
			if (itemsOfSecondStep.length === 0) {
				itemsOfSecondStep = [...data.items];
			}
			setData({
				selectedPicker: getSelectedPicker(2),
				dataSelected: data.dataSelected + "/" + item.Name,
				items: newItems,
				step: 3
			});
		}
	};

	const handleBackButtonPressed = handleClose => {
		if (data.step === 3) {
			const selectedDatas = data.dataSelected.split("/");
			setData({
				selectedPicker: {
					Id: selectedDatas[1],
					Name: selectedDatas[1]
				},
				dataSelected: selectedDatas[0],
				items: itemsOfSecondStep,
				step: 2
			});
		} else if (data.step === 2) {
			resetData();
		} else if (data.step === 1) {
			handleClose();
		}
	};

	const resetData = () => {
		setData({
			selectedPicker: getSelectedPicker(0),
			dataSelected: props.dataSelected,
			items: props.items,
			step: 1
		});
	};

	const handleSubmitData = selected => {
		if (Object.keys(selected).length > 0) {
			const dataSelected = data.dataSelected + "/" + selected.Name;
			props.onSelected(dataSelected, selected.ranks);
			const selectedPicker = data.dataSelected.split("/")[0];
			setData({
				selectedPicker: {
					Id: selectedPicker,
					Name: selectedPicker
				},
				dataSelected: dataSelected,
				items: props.items,
				step: 1
			});
			setIsSubmited(true);
		} else {
			resetData();
		}
	};

	const renderSelectView = (showModal, typeData, labelNoSelect) => (
		<View style={{ position: "relative", flexDirection: "row", alignItems: "center" }}>
			<TouchableOpacity
				style={{
					...styles.input,
					width: "100%",
					borderColor: !props.showError || typeData ? colors.gray : colors.red
				}}
				onPress={showModal}>
				<Text
					style={{
						color: typeData ? colors.black : colors.gray
					}}>
					{typeData ? typeData : labelNoSelect}
				</Text>
			</TouchableOpacity>
			<Image source={require("../assets/images/chevron-down.png")} style={styles.imageChevronDown} />
		</View>
	);

	const renderListItem = (defaultSelected, item) => {
		if (data.step === 1 || (data.step === 2 && item.children)) {
			return <TouchableOpacity onPress={() => handleSelectData(item)}>{renderListItemBase(defaultSelected, item)}</TouchableOpacity>;
		}
		return renderListItemBase(defaultSelected, item);
	};

	const renderListItemBase = (defaultSelected, item) => (
		<View style={styles.styleListItem}>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center"
				}}>
				<View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
					{item.HasImage && (
						<View style={{ width: 32, alignItems: "center", marginRight: 10 }}>
							<Image
								source={categoryIcons[item.Name].uri}
								style={{
									width: categoryIcons[item.Name].width,
									height: categoryIcons[item.Name].height
								}}
							/>
						</View>
					)}

					<Text
						style={{
							fontSize: 15,
							fontWeight: defaultSelected && defaultSelected.Name === item.Name ? "bold" : "normal"
						}}>
						{item.Name}
					</Text>
				</View>
				<Image source={require("../assets/images/chevron-left.png")} style={{ width: 9, height: 13.5 }} />
			</View>
		</View>
	);

	const renderSearch = handleClose => (
		<View
			style={{
				alignItems: "center",
				paddingVertical: 20,
				position: "relative"
			}}>
			<TouchableOpacity onPress={() => handleBackButtonPressed(handleClose)} style={{ position: "absolute", left: 15, top: 29 }}>
				<Image source={require("../assets/images/back.png")} style={{ width: 17.25, height: 17 }} />
			</TouchableOpacity>
			<Text style={styles.label}>Catégories</Text>
			<TouchableOpacity onPress={handleClose} style={{ position: "absolute", right: 15, top: 15 }}>
				<Image source={require("../assets/images/cross-black.png")} style={{ width: 19.5, height: 19 }} />
			</TouchableOpacity>
		</View>
	);
	
	return (
		<PickerModal
			renderSelectView={(disabled, selected, showModal) => renderSelectView(showModal, data.dataSelected, "Sélectionnez une catégorie")}
			onSelected={selected => handleSubmitData(selected)}
			items={data.items}
			selected={data.selectedPicker}
			requireSelection={false}
			renderListItem={renderListItem}
			renderSearch={renderSearch}
		/>
	);
};

const styles = StyleSheet.create({
	input: {
		paddingVertical: 5,
		paddingHorizontal: 0,
		borderBottomWidth: 1
	},
	imageChevronDown: {
		width: 14,
		height: 9,
		right: 15
	},
	styleListItem: {
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.gray
	},
	label: {
		color: colors.black,
		fontWeight: "bold",
		fontSize: 20,
		marginBottom: 5
	}
});

export default PickerCategories;
