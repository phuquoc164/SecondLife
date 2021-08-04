/** React */
import React from "react";
import { FlatList, Image, Modal, Platform, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import { InputSearch } from "../lib/Helpers";
import SafeAreaViewParent from "./SafeAreaViewParent";

const Picker = (props) => {
    const [filter, setFilter] = React.useState({
        keyword: "",
        options: props.items
    });

    React.useEffect(() => {
        setFilter({
            keyword: "",
            options: props.items
        });
    }, [props.items]);
    
    const renderItem = ({ item, index }) => {
        const isLastItem = index === filter.options.length - 1 && Platform.OS === "ios"; // check last item only on ios
        return (
            <TouchableOpacity
                onPress={() => {
                    props.onSelected(item);
                }}
                key={item.id}
                style={{
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.gray,
                    backgroundColor: colors.lightGray,
                    marginBottom: isLastItem ? 50 : 0
                }}>
                <Text style={[styles.textDarkBlue, styles.font18, props.selected && props.selected.name === item.name ? styles.fontSofiaSemiBold : styles.fontSofiaRegular]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <SafeAreaView edges={["top"]} style={styles.header}>
            <TouchableOpacity onPress={props.handleClose} style={styles.backImageBtn}>
                <Image source={require("../assets/images/back_btn.png")} style={styles.backImage} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{props.title}</Text>
        </SafeAreaView>
    );

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newOptions = props.items.filter((item) => item.name.toLowerCase().includes(filterToLower));
        setFilter({
            keyword: filter,
            options: newOptions
        });
    };

    return (
        <Modal animationType="slide" visible={props.visible}>
            {renderHeader()}
            {props.placeholderInputSearch && (
                <InputSearch placeholder={props.placeholderInputSearch} placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            )}
            <SafeAreaViewParent>
                <FlatList data={filter.options} renderItem={renderItem} keyExtractor={(item) => item.id} />
            </SafeAreaViewParent>
        </Modal>
    );
};;

export default Picker;
