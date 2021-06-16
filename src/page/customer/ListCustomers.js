/** React */
import React from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import { AuthContext } from "../../lib/AuthContext";
import FetchService from "../../lib/FetchService";
import { colors } from "../../lib/colors";
import { InputSearch, loading } from "../../lib/Helpers";

const ListCustomers = (props) => {
    const [state, setState] = React.useState({
        allCustomers: [],
        filteredCustomers: [],
        filter: ""
    });
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
        FetchService.get("/customers", user.token)
            .then((result) => {
                if (result && result["hydra:member"]?.length > 0) {
                    setState({
                        allCustomers: result["hydra:member"],
                        filteredCustomers: result["hydra:member"],
                        filter: ""
                    });
                }
            })
            .catch((error) => {
                if (error === 401) {
                    Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: signOut }]);
                } else {
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
                <View style={styles.flex3}>
                    <Text style={[styles.font18, styles.fontSofiaSemiBold, styles.textDarkBlue]}>{`${item.firstname} ${item.lastname}`}</Text>
                    <Text style={[styles.font12, styles.fontSofiaRegular, styles.textMediumGray]}>Email: {item.email}</Text>
                    <Text style={[styles.font12, styles.fontSofiaRegular, styles.textMediumGray]}>N° tel: {item.phone}</Text>
                </View>
                <View style={[styles.flex2]}>
                    <Text style={[styles.font14, styles.fontSofiaSemiBold, styles.textCenter, { paddingBottom: 10 }]}>Bons d'achats:</Text>
                    <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textGreen, styles.textCenter]}>{item.availableVouchers.length}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newfilteredCustomers = state.allCustomers.filter((customer) => {
            const { firstname, lastname, email, phone } = customer;
            const fullname = firstname + " " + lastname;
            return (
                fullname.toLowerCase().includes(filterToLower) ||
                firstname.toLowerCase().includes(filterToLower) ||
                lastname.toLowerCase().includes(filterToLower) ||
                email.includes(filterToLower) ||
                phone.includes(filterToLower)
            );
        });
        setState({
            ...state,
            filteredCustomers: newfilteredCustomers,
            filter
        });
    };

    return (
        <SafeAreaView style={styles.mainScreen}>
            <InputSearch placeholder="Chercher un client" placeholderTextColor={colors.lightBlue} value={state.filter} filterData={filterData} />
            <FlatList data={state.filteredCustomers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
        </SafeAreaView>
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
    }
});

export default ListCustomers;
