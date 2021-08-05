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

    const handleAddCustomer = (newCustomer) => {
        FetchService.post("/customers", { ...newCustomer, store: user.store }, user.token)
            .then((result) => {
                if (!!result) {
                    props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { customerId: result["@id"] } });
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

    return (
        <SafeAreaViewParent>
            <ScrollView>
                <View style={{ paddingVertical: 20 }}>
                    <FormCustomer customer={initialCustomer} editable={true} btnSubmitTitle={"Enregistrer et ajouter un\nproduit"} handleSubmit={handleAddCustomer} />
                </View>
            </ScrollView>
        </SafeAreaViewParent>
    );
};

export default NewCustomer;
