/** React */
import React from "react";
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import { InputSearch } from "../lib/Helpers";

const Picker = (props) => {
    const [filter, setFilter] = React.useState({
        keyword: "",
        options: props.items
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                props.onSelected(item);
            }}
            key={item.id}
            style={{
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray,
                backgroundColor: colors.lightGray
            }}
		>
            <Text style={[styles.textDarkBlue, styles.font18, props.selected && props.selected.name === item.name ? styles.fontSofiaSemiBold : styles.fontSofiaRegular]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={props.handleClose} style={styles.backImageBtn}>
                <Image source={require("../assets/images/back_btn.png")} style={styles.backImage} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{props.title}</Text>
        </View>
    );

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newOptions = props.items.filter((item) => item.Name.toLowerCase.includes(filterToLower));
        setFilter({
            keyword: filter,
            options: newOptions
        });
    };

    return (
        <Modal animationType="slide" visible={props.visible}>
            {renderHeader()}
            <SafeAreaView style={[styles.mainScreen, { flex: 1 }]}>
                {props.renderSearch && <InputSearch placeholder="Cherchez une marque" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} enabled>
                    <FlatList data={filter.options} renderItem={renderItem} keyExtractor={(item) => item.id} />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

export default Picker;
