/** React */
import React from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, Text, View, Alert } from "react-native";
import styles from "../../assets/css/styles";
import FormCustomer from "../../components/FormCustomer";

/** App */
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import FetchService from "../../lib/FetchService";
import { loading } from "../../lib/Helpers";

const CustomerDetailProduct = (props) => {
    const [customer, setCustomer] = React.useState(null);
    const [editable, setEditable] = React.useState(false);

    const { user } = React.useContext(AuthContext);
    const { token, store } = user;

    React.useEffect(() => {
        if (props.route.params.customerId) {
            getCustomer(props.route.params.customerId);
        }
    }, [props.route.params]);

    const getCustomer = (customerId) => {
        FetchService.get(customerId, token)
            .then((result) => {
                if (result) {
                    setCustomer(result);
                }
            })
            .catch((error) => {
                // TODO: change text
                console.error(error);
                Alert.alert("Customer error", "Get customer error");
            });
    };

    const handleOpenModificationPage = () => {
        setEditable(true);
        props.navigation.setOptions({ title: "Modifier les informations" });
    };

    // TODO: modify customer
    const handleModifyCustomer = (newCustomer) => {

    };

    if (!customer) {
        return loading();
    }

    return (
        <SafeAreaView style={styles.mainScreen}>
            <ScrollView style={{ paddingTop: 20 }}>
                <FormCustomer customer={customer} editable={editable} btnSubmitTitle="Enregistrer les informations" handleSubmit={handleModifyCustomer} />
                {!editable && (
                    <View>
                        <TouchableOpacity
                            onPress={handleOpenModificationPage}
                            style={{ marginHorizontal: 30, marginTop: 20, borderRadius: 11, paddingVertical: 15, backgroundColor: colors.darkBlue }}>
                            <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaRegular]}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { customerId: customer["@id"] } })}
                            style={[styles.greenScreen, { marginHorizontal: 30, marginTop: 20, marginBottom: 70, borderRadius: 11, paddingVertical: 15 }]}>
                            <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaMedium]}>Ajouter un produit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CustomerDetailProduct;
