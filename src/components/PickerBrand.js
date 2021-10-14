/** React */
import React from "react";
import { Alert, FlatList, Image, Modal, Platform, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import FetchService from "../lib/FetchService";
import { InputSearch, loading } from "../lib/Helpers";
import SafeAreaViewParent from "./SafeAreaViewParent";

const PickerBrand = (props) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [options, setOptions] = React.useState(props.items);
    const [filter, setFilter] = React.useState("");

    React.useEffect(() => {
        setOptions(props.items);
        setFilter("");
    }, [props.items]);

    const renderItem = ({ item, index }) => {
        const isLastItem = index === options.length - 1 && Platform.OS === "ios"; // check last item only on ios
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
                    marginBottom: isLastItem ? 50 : 0,
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
        setFilter(filter);
        setIsLoading(true);
        const endPoint = filter === "" ? "/brands?page=1" : "/brands?name=" + filter;
        FetchService.get(endPoint, props.token)
            .then((result) => {
                if (result) {
                    const listOptions = result["hydra:member"].map((brand) => ({ id: brand["@id"], name: brand.name, categories: brand.categories }));
                    setOptions(listOptions);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    return (
        <Modal animationType="slide" visible={props.visible}>
            {renderHeader()}
            <InputSearch placeholder="Cherchez une marque" placeholderTextColor={colors.lightBlue} value={filter} filterData={filterData} />
            {isLoading ? (
                loading()
            ) : (
                <SafeAreaViewParent>
                    <FlatList data={options} renderItem={renderItem} keyExtractor={(item) => item.id} />
                </SafeAreaViewParent>
            )}
        </Modal>
    );
};

export default PickerBrand;
