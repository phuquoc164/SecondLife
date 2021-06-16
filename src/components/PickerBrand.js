/** React */
import React from "react";
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

/** App */
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";
import FetchService from "../lib/FetchService";
import { InputSearch, loading } from "../lib/Helpers";

const PickerBrand = (props) => {
    const [isLoading, setIsLoading] = React.useState(false);
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

    const renderItem = ({ item }) => (
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
                backgroundColor: colors.lightGray
            }}>
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
        setFilter({...filter, keyword: filter});
        setIsLoading(true);
        const endPoint = filter === "" ? "/brands?page=1" : "/brands?name=" + filter;
        FetchService.get(endPoint, props.token)
            .then((result) => {
                if (result) {
                    const listOptions = result["hydra:member"].map((brand) => ({ id: brand["@id"], name: brand.name, categories: brand.categories }));
                    setFilter({
                        keyword: filter,
                        options: listOptions
                    });
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
            <SafeAreaView style={[styles.mainScreen, { flex: 1 }]}>
                <InputSearch placeholder="Cherchez une marque" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
                {isLoading ? (
                    loading()
                ) : (
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} enabled>
                        <FlatList data={filter.options} renderItem={renderItem} keyExtractor={(item) => item.id} />
                    </KeyboardAvoidingView>
                )}
            </SafeAreaView>
        </Modal>
    );
};

export default PickerBrand;
