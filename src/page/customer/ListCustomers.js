/** React */
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, FlatList, Platform } from "react-native";

/** App */
import SafeAreaViewParent from "../../components/SafeAreaViewParent";
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { InputSearch, loading } from "../../lib/Helpers";

const ListCustomers = (props) => {
    const [state, setState] = React.useState({
        allCustomers: [],
        filteredCustomers: []
    });
    const [filter, setFilter] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const { user, signOut } = React.useContext(AuthContext);
    const routeParams = props.route.params;

    React.useEffect(() => {
        getListCustomers();
        const willFocusSubscription = props.navigation.addListener("focus", () => {
            getListCustomers();
        });

        return willFocusSubscription;
    }, []);

    const getListCustomers = () => {
        setIsLoading(true);
        FetchService.get("/customers", user.token)
            .then((result) => {
                if (result && result["hydra:member"]?.length > 0) {
                    setState({
                        allCustomers: result["hydra:member"],
                        filteredCustomers: result["hydra:member"]
                    });
                    setFilter("");
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                if (error === 401) {
                    Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: signOut }]);
                } else {
                    setIsLoading(false);
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                }
            });
    };

    const handlePressItem = (item) => {
        if (routeParams && routeParams.addProduct) {
            props.navigation.navigate("NewProduct", { screen: "CustomerDetailProduct", params: { customerId: item["@id"] } });
        } else {
            props.navigation.navigate("Customer", { screen: "CustomerDetail", params: { customerId: item["@id"] } });
        }
    };

    if (state.allCustomers.length === 0) return loading();

    const renderItem = ({ item }) => (
        <TouchableOpacity key={item["@id"]} onPress={() => handlePressItem(item)}>
            <View style={componentStyle.singleCustomer}>
                <View style={styles.flex2}>
                    <Text
                        style={[
                            styles.font18,
                            styles.fontSofiaSemiBold,
                            styles.textDarkBlue,
                            Platform.OS === "ios" && componentStyle.paddingBottomIos
                        ]}>{`${item.firstname} ${item.lastname}`}</Text>
                    <Text style={[styles.font12, styles.fontSofiaRegular, styles.textMediumGray, Platform.OS === "ios" && componentStyle.paddingBottomIos]}>
                        Email: {item.email}
                    </Text>
                    <Text style={[styles.font12, styles.fontSofiaRegular, styles.textMediumGray, Platform.OS === "ios" && componentStyle.paddingBottomIos]}>
                        N° tel: {item.phone}
                    </Text>
                </View>
                <View style={[styles.flex1]}>
                    <Text style={[styles.font14, styles.fontSofiaSemiBold, styles.textCenter, { paddingBottom: 10 }]}>Bons d'achats:</Text>
                    <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textGreen, styles.textCenter]}>{item.availableVouchers.length}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const filterData = (filter) => {
        setFilter(filter);
        if (state.allCustomers.length > 0) {
            const endPoint = filter === "" ? "/customers?page=1" : "/customers?page=1&lastname=" + filter;
            setIsLoading(true);
            FetchService.get(endPoint, user.token)
                .then((result) => {
                    if (result && result["hydra:member"]) {
                        setState({
                            ...state,
                            filteredCustomers: result["hydra:member"]
                        });
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                });
        }
    };

    return (
        <SafeAreaViewParent>
            <InputSearch placeholder="Chercher un client" placeholderTextColor={colors.lightBlue} value={filter} filterData={filterData} />
            {isLoading && loading()}
            {!isLoading &&
                (state.allCustomers.length > 0 && state.filteredCustomers.length > 0 ? (
                    <FlatList data={state.filteredCustomers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
                ) : (
                    <Text style={[styles.textCenter, styles.textDarkBlue, styles.font20, styles.fontSofiaMedium, { paddingVertical: 10 }]}>Aucun clien trouvé</Text>
                ))}
        </SafeAreaViewParent>
    );
};

const componentStyle = StyleSheet.create({
    singleCustomer: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        marginHorizontal: 20
    },
    paddingBottomIos: {
        paddingBottom: 5
    }
});

export default ListCustomers;
