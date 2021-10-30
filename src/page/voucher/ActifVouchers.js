/** React */
import React, { useState } from "react";
import { View, Text, FlatList, Alert, Platform } from "react-native";

/** App */
import ModalConfirmation from "../../components/ModalConfirmation";
import SwipeableComponent from "../../components/SwipeableComponent";
import SafeAreaViewParent from "../../components/SafeAreaViewParent";
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { convertDateToDisplay, InputSearch } from "../../lib/Helpers";
import { loading } from "../../lib/Helpers";

let voucherSwiped = null;
const marginBottomText = Platform.OS === "ios" ? 6 : 0;

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

    /**
     * update data when props of navigation change
     */
    React.useEffect(() => {
        if (props.route.params) {
            const paramsNavigation = props.route.params;
            if (paramsNavigation.available && paramsNavigation.usedOrExpired) {
                // navigate from list vouchers history
                setIsLoading(true);
                const { available, usedOrExpired } = paramsNavigation;
                setVouchers({ available, usedOrExpired });
                setFilter({
                    keyword: "",
                    vouchers: available
                });
                setIsLoading(false);
            } else if (paramsNavigation.customer && !paramsNavigation.forceUpdate) {
                // navigate from page customer detail
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
                // navigate from page scanner
                getListVouchersFromReference(paramsNavigation.reference);
            } else if (paramsNavigation.forceUpdate) {
                // navigate when we push the bottom bar item
                getListVouchers();
            }
        }
    }, [props.route.params]);

    /**
     * send request to get list vouchers
     */
    const getListVouchers = () => {
        setIsLoading(true);
        FetchService.get("/vouchers", user.token)
            .then((result) => {
                if (result && result["hydra:member"]) {
                    const available = [];
                    const usedOrExpired = [];
                    result["hydra:member"].forEach((voucher) => {
                        if (voucher.used || voucher.expired) {
                            usedOrExpired.push(voucher);
                        } else {
                            available.push(voucher);
                        }
                    });
                    setVouchers({ available, usedOrExpired });
                    setFilter({
                        keyword: "",
                        vouchers: available
                    });
                    setIsLoading(false);
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

    const getListVouchersFromReference = (reference) => {
        const endpoint = "/vouchers?page=1&reference=" + reference;
        FetchService.get(endpoint, user.token)
            .then((result) => {
                if (result && result["hydra:member"]) {
                    const listVouchersActif = result["hydra:member"].filter((voucher) => !voucher.used && !voucher.expired);
                    setFilter({
                        keyword: reference,
                        vouchers: listVouchersActif
                    });
                    setIsLoading(false);
                    props.navigation.setParams({ reference: null });
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * send request to mask voucher as used
     */
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
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * render single voucher
     * @param {} param0
     * @returns
     */
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
                    <Text
                        style={[
                            styles.font24,
                            styles.fontSofiaSemiBold,
                            styles.textDarkBlue,
                            { marginVertical: Platform.OS === "ios" ? 10 : 0 }
                        ]}>{`${item.customer.firstname} ${item.customer.lastname}`}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue, { marginBottom: marginBottomText }]}>{item.customer.email}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue, { marginBottom: marginBottomText }]}>
                        {item.reference ? item.reference.substring(0, 10) : item["@id"]}
                    </Text>
                    <Text style={[styles.font16, styles.fontSofiaSemiBold, styles.textMediumGray, { marginBottom: marginBottomText }]}>
                        {convertDateToDisplay(item.expirationDate, true)}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textRight, { marginVertical: Platform.OS === "ios" ? 10 : 0 }]}>
                        {item.voucherAmount}€
                    </Text>
                </View>
            </View>
        </SwipeableComponent>
    );

    /**
     * filter data
     * @param {*} filter
     */
    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newFilteredVouchers = vouchers.available.filter((voucher) => {
            const { voucherAmount, expirationDate, customer, reference } = voucher;
            const expirationDateFormatted = convertDateToDisplay(expirationDate);
            const customerFullName = customer.firstname + " " + customer.lastname;

            return (
                customerFullName.toLowerCase().includes(filterToLower) ||
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
        <SafeAreaViewParent edges={["bottom"]} style={styles.mainScreen}>
            {!props.route.params?.customer || props.route.params?.forceUpdate ? (
                <InputSearch placeholder="Chercher un bon d'achat" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            ) : (
                <View style={{ paddingVertical: 10 }}></View>
            )}

            {filter.vouchers.length > 0 ? (
                <FlatList data={filter.vouchers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
            ) : (
                <Text style={[styles.textCenter, styles.textDarkBlue, styles.font20, styles.fontSofiaMedium, { paddingVertical: 10 }]}>Il n'y a aucun voucher</Text>
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
        </SafeAreaViewParent>
    );
};

export default ActifVouchers;
