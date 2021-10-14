/** React */
import React from "react";
import { Text, StyleSheet, ScrollView, Alert } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FormCustomer from "../../components/FormCustomer";
import SafeAreaViewParent from "../../components/SafeAreaViewParent";
import { AuthContext } from "../../lib/AuthContext";
import { initialCustomer } from "../../lib/constants";
import FetchService from "../../lib/FetchService";
import { convertDateToApi, getSimpleDiff } from "../../lib/Helpers";

const ModifyCustomer = (props) => {
    const customer = props.route.params?.customer ? props.route.params.customer : initialCustomer;
    const { user } = React.useContext(AuthContext);
    const { token, store } = user;

    const handleModifyCustomer = (newCustomer) => {
        newCustomer.birthday = convertDateToApi(newCustomer.birthday);
        const diffs = getSimpleDiff(customer, newCustomer);
        const data = { store, ...diffs };
        if (Object.keys(diffs).length > 0) {
            FetchService.patch(customer["@id"], data, token)
                .then((result) => {
                    if (!!result) {
                        props.navigation.navigate("Customer", { screen: "CustomerDetail", params: { customer: result, customerId: null } });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                });
        } else {
            props.navigation.navigate("Customer", { screen: "CustomerDetail", params: { customer, customerId: null } });
        }
    };

    return (
        <SafeAreaViewParent>
            <ScrollView>
                <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textCenter, componentStyle.title]}>Informations client</Text>
                <FormCustomer customer={customer} editable={true} btnSubmitTitle="Enregistrer les informations" handleSubmit={handleModifyCustomer} />
            </ScrollView>
        </SafeAreaViewParent>
    );
};

const componentStyle = StyleSheet.create({
    title: {
        paddingTop: 20,
        paddingBottom: 15
    }
});
export default ModifyCustomer;
