/** React */
import React from "react";
import { ScrollView, TouchableOpacity, Text, View, Alert, Platform } from "react-native";
import styles from "../../assets/css/styles";
import FormCustomer from "../../components/FormCustomer";
import SafeAreaViewParent from "../../components/SafeAreaViewParent";

/** App */
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import FetchService from "../../lib/FetchService";
import { convertDateToApi, getSimpleDiff, loading } from "../../lib/Helpers";

const paddingTop = Platform.OS === "ios" ? 20 : 15;

const CustomerDetailProduct = (props) => {
    const [customer, setCustomer] = React.useState(null);
    const [editable, setEditable] = React.useState(false);

    const { user } = React.useContext(AuthContext);
    const { token, store, voucherTrigger } = user;
    const hasReferenceField = Boolean(voucherTrigger);

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
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    const handleOpenModificationPage = () => {
        setEditable(true);
        props.navigation.setOptions({ title: "Modifier les informations" });
    };

    const handleModifyCustomer = (newCustomer, callback, resetReference) => {
        const customerCopy = { ...customer };
        customerCopy.birthday = customerCopy.birthday.slice(0, 10);
        newCustomer.birthday = convertDateToApi(newCustomer.birthday);
        const diffs = getSimpleDiff(customerCopy, newCustomer);
        const data = { store, ...diffs };
        if (Object.keys(diffs).length > 0) {
            FetchService.patch(customer["@id"], data, token)
                .then((result) => {
                    if (!!result) {
                        callback();
                        setCustomer(result);
                        setEditable(false);
                        props.navigation.setOptions({ title: "Informations client" });
                    }
                })
                .catch((error) => {
                    callback();
                    console.error(error);
                    if (error === 400) {
                        resetReference();
                        Alert.alert("Erreur", "Votre référence n'est pas valide.");
                    } else {
                        Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
                    }
                });
        } else {
            callback();
            setEditable(false);
            props.navigation.setOptions({ title: "Informations client" });
        }
    };

    if (!customer) {
        return loading();
    }

    return (
        <SafeAreaViewParent>
            <ScrollView style={{ paddingTop: 20 }}>
                <FormCustomer
                    hasReferenceField={hasReferenceField}
                    customer={customer}
                    editable={editable}
                    btnSubmitTitle="Enregistrer les informations"
                    handleSubmit={handleModifyCustomer}
                />
                {!editable && (
                    <View>
                        <TouchableOpacity
                            onPress={handleOpenModificationPage}
                            style={{ marginHorizontal: 20, marginTop: 20, borderRadius: 11, paddingBottom: 15, paddingTop, backgroundColor: colors.darkBlue }}>
                            <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaRegular]}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate("NewProduct", { screen: "AddProduct", params: { customerId: customer["@id"], forceReset: true } })}
                            style={[styles.greenScreen, { marginHorizontal: 20, marginTop: 20, marginBottom: 70, borderRadius: 11, paddingBottom: 15, paddingTop }]}>
                            <Text style={[styles.font20, styles.textWhite, styles.textCenter, styles.fontSofiaMedium]}>Ajouter un produit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaViewParent>
    );
};

export default CustomerDetailProduct;
