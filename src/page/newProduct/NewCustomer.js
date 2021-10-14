/** React */
import React from "react";
import { Alert, ScrollView, View } from "react-native";

/** App */
import SafeAreaViewParent from "../../components/SafeAreaViewParent";
import FormCustomer from "../../components/FormCustomer";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { initialCustomer } from "../../lib/constants";

const NewCustomer = (props) => {
    const { user, signOut } = React.useContext(AuthContext);
    const hasReferenceField = Boolean(user.voucherTrigger);

    const handleAddCustomer = (newCustomer, callback) => {
        const { reference, ...customerWithoutRef } = newCustomer;
        const data = hasReferenceField && reference && reference !== "" ? 
            { ...newCustomer, store: user.store } :
            { ...customerWithoutRef, store: user.store };
        FetchService.post("/customers", data, user.token)
            .then((result) => {
                if (!!result) {
                    callback();
                    props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { customerId: result["@id"] } });
                }
            })
            .catch((error) => {
                callback();
                if (error === 401) {
                    Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: signOut }]);
                } else {
                    console.error(error);
                    Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                }
            });
    };

    return (
        <SafeAreaViewParent>
            <ScrollView>
                <View style={{ paddingVertical: 20 }}>
                    <FormCustomer
                        timestamp={props.route.params?.timestamp}
                        hasReferenceField={hasReferenceField}
                        customer={initialCustomer}
                        editable={true}
                        btnSubmitTitle={"Enregistrer et ajouter un\nproduit"}
                        handleSubmit={handleAddCustomer}
                    />
                </View>
            </ScrollView>
        </SafeAreaViewParent>
    );
};

export default NewCustomer;
