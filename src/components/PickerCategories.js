/** React */
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, Modal, SafeAreaView, Platform, FlatList, KeyboardAvoidingView } from "react-native";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";

let itemsOfSecondStep = [];
const PickerCategories = (props) => {
    const { visible, title, items, categoryIds, prefix, selected, onSelected, handleClose } = props;

    const getSelectedPicker = (index) => {
        if (selected) {
            const selectedDatas = selected.split("/");
            const prefixIndex = prefix[selectedDatas[0]];
            const name = selectedDatas[index];
            return {
                "@id": categoryIds[prefixIndex + name],
                name
            }
        }
        return null;
    };

    const [data, setData] = useState({
        selectedPicker: getSelectedPicker(0),
        selected,
        items,
        step: 1
    });
    const [isSubmited, setIsSubmited] = useState(false);

    useEffect(() => {
        if (!isSubmited && selected !== data.selected) {
            setData({
                selectedPicker: getSelectedPicker(0),
                selected,
                items,
                step: 1
            });
        } else if (isSubmited) {
            setIsSubmited(false);
        }
    }, [selected]);

    useEffect(() => {
        setData({
            selectedPicker: null,
            selected: selected,
            items,
            step: 1
        });
    }, [items]);

    const handleSelectData = (item) => {
        const newItems = [];
        if (data.step === 1) {
            item.children.forEach((child) => {
                newItems.push({
                    "@id": child["@id"],
                    name: child.name,
                    children: child.children
                });
            });
			const selectedPicker = data.selectedPicker && item.name === data.selectedPicker.name ? getSelectedPicker(1) : null;

            setData({
                selectedPicker,
                selected: item.name,
                items: newItems,
                step: 2
            });
        } else if (data.step === 2 && item.children.length > 0) {
            item.children.forEach((child) => {
                newItems.push({
                    "@id": child["@id"],
                    name: child.name
                });
            });

            // get the data of second step
            if (itemsOfSecondStep.length === 0) {
                itemsOfSecondStep = [...data.items];
            }

            setData({
                selectedPicker: getSelectedPicker(2),
                selected: data.selected + "/" + item.name,
                items: newItems,
                step: 3
            });
        }
    };

    const handleBackButtonPressed = () => {
        if (data.step === 3) {
            const selectedNames = data.selected.split("/");
            setData({
                selectedPicker: {
                    "@id": categoryIds[selectedNames[1]],
                    name: selectedNames[1]
                },
                selected: selectedNames[0],
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
            selected: selected,
            items,
            step: 1
        });
    };

    const handleSubmitData = (item) => {
        if (Object.keys(item).length > 0) {
            const selected = data.selected + "/" + item.name;
            onSelected(selected);
            const name = data.selected.split("/")[0];
            // reset data
            setData({
                selectedPicker: {
                    "@id": categoryIds[prefix[name] + name],
                    name
                },
                selected,
                items,
                step: 1
            });
            setIsSubmited(true);
        } else {
            resetData();
        }
    };

    const renderItem = ({ item, index }) => {
        if (data.step === 1 || (data.step === 2 && item.children.length > 0)) {
            return (
                <TouchableOpacity key={item["@id"]} onPress={() => handleSelectData(item)}>
                    {renderListItemBase(item)}
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity key={item["@id"]} onPress={() => handleSubmitData(item)}>
                {renderListItemBase(item, false)}
            </TouchableOpacity>
        );
    };

    const renderListItemBase = (item, showArrow = true) => (
        <View
            style={{
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray,
                backgroundColor: colors.lightGray,
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
            <Text style={[styles.textDarkBlue, styles.font18, data.selectedPicker && data.selectedPicker["@id"] === item["@id"] ? styles.fontSofiaSemiBold : styles.fontSofiaRegular]}>
                {item.name}
            </Text>
            {showArrow && <Image source={require("../assets/images/chevron-left.png")} style={{ width: 25, height: 20.7, top: 3 }} />}
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackButtonPressed} style={styles.backImageBtn}>
                <Image source={require("../assets/images/back_btn.png")} style={styles.backImage} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );

    return (
        <Modal animationType="slide" visible={visible}>
            {renderHeader()}
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
                {/* {props.renderSearch && <InputSearch placeholder="Cherchez une marque" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />} */}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} enabled>
                    <FlatList data={data.items} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

export default PickerCategories;
