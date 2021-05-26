/** React */
import React from "react";
import { Text, StyleSheet, ScrollView, SafeAreaView, Alert } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FormCustomer from "../../components/FormCustomer";
import { AuthContext } from "../../lib/AuthContext";
import { initialCustomer } from "../../lib/constants";
import FetchService from "../../lib/FetchService";
import { getSimpleDiff } from "../../lib/Helpers";

const ModifyCustomer = (props) => {
    const customer = props.route.params?.customer ? props.route.params.customer : initialCustomer;
    const { user } = React.useContext(AuthContext);
    const { token, store } = user;
    
    const handleModifyCustomer = (newCustomer) => {
        const diffs = getSimpleDiff(customer, newCustomer);
        const data = { store, ...diffs };

        FetchService.patch(customer["@id"], data, token)
            .then((result) => {
                if (!!result) {

                }
            })
            .catch((error) => {
                console.error("Modify Customer Error", error);
                // TODO: change text
                Alert.alert("Erreur");
            });
    }
    
    return (
        <SafeAreaView style={styles.mainScreen}>
            <ScrollView>
                <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textCenter, componentStyle.title]}>Informations client</Text>
                <FormCustomer customer={customer} editable={true} btnSubmitTitle="Enregistrer les informations" handleSubmit={handleModifyCustomer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const componentStyle = StyleSheet.create({
    title: {
        paddingTop: 20,
        paddingBottom: 15
    }
})
export default ModifyCustomer;