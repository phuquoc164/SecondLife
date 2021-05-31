/** React */
import React from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";

/** App */
import styles from "../../assets/css/styles";
import FormCustomer from "../../components/FormCustomer";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { initialCustomer } from "../../lib/constants";

const NewCustomer = (props) => {
    const { user } = React.useContext(AuthContext);

    const handleAddCustomer = (newCustomer) => {
        FetchService.post("/customers", { ...newCustomer, store: user.store }, user.token)
            .then((result) => {
                if (!!result) {
                    props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { customerId: result["@id"] } });
                }
            })
            .catch((error) => {
                // TODO: change text
                console.error("New Customer Error", error);
                Alert.alert("New Customer Error");
            });
    };

    return (
        <SafeAreaView style={styles.mainScreen}>
            <ScrollView>
                <View style={{ paddingVertical: 20 }}>
                    <FormCustomer customer={initialCustomer} editable={true} btnSubmitTitle={"Enregistrer et ajouter un\nproduit"} handleSubmit={handleAddCustomer} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewCustomer;
