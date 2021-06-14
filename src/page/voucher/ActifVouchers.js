/** React */
import React, { useState } from "react";
import { View, SafeAreaView, Text, FlatList, Alert } from "react-native";

/** App */
import ModalConfirmation from "../../components/ModalConfirmation";
import SwipeableComponent from "../../components/SwipeableComponent";
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { convertDateToDisplay, InputSearch } from "../../lib/Helpers";
import { loading } from "../../lib/Helpers";

let voucherSwiped = null;

const ActifVouchers = (props) => {
    const [vouchers, setVouchers] = useState({
        available: [],
        usedOrExpired: []
    });
    const [filter, setFilter] = useState({
        keyword: "",
        vouchers: []
    });
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user, signOut } = React.useContext(AuthContext);

    React.useEffect(() => {
        if (props.route.params) {
            const paramsNavigation = props.route.params;
            if (paramsNavigation.available && paramsNavigation.usedOrExpired) {
                setIsLoading(true);
                const { available, usedOrExpired } = paramsNavigation;
                setVouchers({ available, usedOrExpired });
                setFilter({
                    keyword: "",
                    vouchers: available
                });
                setIsLoading(false);
            } else if (paramsNavigation.customer && !paramsNavigation.fromBottomMenu) {
                setIsLoading(true);
                const { customer } = paramsNavigation;
                const available = [];
                const usedOrExpired = [];
                customer.vouchers.forEach((voucher) => {
                    const newVoucher = {
                        ...voucher,
                        id: voucher["@id"],
                        customer: {
                            "@id": customer["@id"],
                            firstname: customer.firstname,
                            lastname: customer.lastname,
                            email: customer.email
                        }
                    };
                    if (voucher.used || voucher.expired) {
                        usedOrExpired.push(newVoucher);
                    } else {
                        available.push(newVoucher);
                    }
                });
                setVouchers({ available, usedOrExpired });
                setFilter({
                    keyword: "",
                    vouchers: available
                });
                setIsLoading(false);
            } else if (paramsNavigation.reference) {
                getListVouchers(paramsNavigation.reference);
                props.navigation.setParams({ reference: null });
            } else if (paramsNavigation.fromBottomMenu) {
                getListVouchers();
            }
        }
    }, [props.route.params]);

    const getListVouchers = (reference = null) => {
        setIsLoading(true);
        FetchService.get("/vouchers", user.token)
            .then((result) => {
                console.log(result);
                if (result && result["hydra:member"] && result["hydra:member"].length > 0) {
                    const available = [];
                    const usedOrExpired = [];
                    console.log("go here ne");
                    result["hydra:member"].forEach((voucher) => {
                        if (voucher.used || voucher.expired) {
                            usedOrExpired.push(voucher);
                        } else {
                            available.push(voucher);
                        }
                    });
                    setVouchers({ available, usedOrExpired });
                    if (reference) {
                        const voucherFiltered = available.filter((voucher) => voucher.reference === props.route.params.reference);
                        setFilter({
                            keyword: props.route.params.reference,
                            vouchers: voucherFiltered
                        });
                    } else {
                        setFilter({
                            keyword: "",
                            vouchers: available
                        });
                    }
                    setIsLoading(false);
                    props.route.params?.fromBottomMenu && props.navigation.setParams({ fromBottomMenu: null });
                }
            })
            .catch((error) => {
                // TODO: change texte
                if (error === 401) {
                    Alert.alert("Erreur système", "Votre session est expirée, veuillez-vous re-connecter!", [{ text: "Se connecter", onPress: signOut }]);
                } else {
                    console.error(error);
                    Alert.alert("Voucher error", "Get voucher error");
                }
            });
    };

    const handleMaskAsUsedVoucher = () => {
        const data = { used: true };
        setModalConfirmation(false);
        FetchService.patch(voucherSwiped["@id"], data, user.token)
            .then((result) => {
                if (!!result && result["@id"]) {
                    const newAvailableVouchers = vouchers.available.filter((voucher) => voucher["@id"] !== voucherSwiped["@id"]);
                    const newUsedVouchers = [...vouchers.usedOrExpired, { ...voucherSwiped, used: true }];
                    const newVouchers = { available: newAvailableVouchers, usedOrExpired: newUsedVouchers };
                    setVouchers(newVouchers);
                    setFilter({
                        keyword: "",
                        vouchers: newVouchers.available
                    });
                    props.navigation.navigate("Voucher", { screen: "InactifVouchers", params: newVouchers });
                }
            })
            .catch((error) => {
                // TODO: Change text
                console.error(error);
                Alert.alert("Voucher error", "Déactiver voucher error");
            });
    };

    const renderItem = ({ item, index }) => (
        <SwipeableComponent
            key={item["@id"]}
            index={index}
            data={item}
            title={"Marquer\ncomme\nutilisé"}
            handleAction={(voucher) => {
                setModalConfirmation(true);
                voucherSwiped = voucher;
            }}>
            <View style={styles.singleVoucher}>
                <View>
                    <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textDarkBlue]}>{`${item.customer.firstname} ${item.customer.lastname}`}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.customer.email}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.reference ? item.reference.substring(0, 10) : item["@id"]}</Text>
                    <Text style={[styles.font16, styles.fontSofiaSemiBold, styles.textMediumGray]}>{convertDateToDisplay(item.expirationDate, true)}</Text>
                </View>
                <View>
                    <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textRight]}>{item.voucherAmount}€</Text>
                </View>
            </View>
        </SwipeableComponent>
    );

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newFilteredVouchers = vouchers.available.filter((voucher) => {
            const { voucherAmount, expirationDate, customer, reference } = voucher;
            const expirationDateFormatted = convertDateToDisplay(expirationDate);

            return (
                customer.firstname.toLowerCase().includes(filterToLower) ||
                customer.lastname.toLowerCase().includes(filterToLower) ||
                customer.email.includes(filterToLower) ||
                voucher["@id"].includes(filterToLower) ||
                voucherAmount.toString().includes(filterToLower) ||
                expirationDateFormatted.toLowerCase().includes(filterToLower) ||
                (reference && reference.toLowerCase().includes(filterToLower))
            );
        });
        setFilter({
            keyword: filter,
            vouchers: newFilteredVouchers
        });
    };

    if (isLoading) {
        return <View style={styles.mainScreen}>{loading()}</View>;
    }

    return (
        <SafeAreaView style={styles.mainScreen}>
            {!props.route.params?.customer || props.route.params?.fromBottomMenu ? (
                <InputSearch placeholder="Chercher un bon d'achat" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            ) : (
                <View style={{ paddingVertical: 10 }}></View>
            )}

            {filter.vouchers.length > 0 ? (
                <FlatList data={filter.vouchers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
            ) : (
                <Text style={[styles.textCenter, styles.textDarkBlue, styles.font20, styles.fontSofiaMedium, { paddingVertical: 10 }]}>Il n'y a aucune vouchers</Text>
            )}
            <ModalConfirmation
                visible={modalConfirmation}
                description={"Êtes-vous sûr de vouloir\nmarquer ce bon\nd’achat comme utilisé ?"}
                handleSubmit={handleMaskAsUsedVoucher}
                handleCancel={() => {
                    setModalConfirmation(false);
                    voucherSwiped = null;
                }}
            />
        </SafeAreaView>
    );
};

export default ActifVouchers;
