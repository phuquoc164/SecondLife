/** React */
import React, { useState } from "react";
import { View, Text, FlatList, Alert, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

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

const InactifVouchers = (props) => {
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
    const { user } = React.useContext(AuthContext);

    /** Update data when we have change of params */
    React.useEffect(() => {
        if (props.route.params) {
            setIsLoading(true);
            if (props.route.params.available && props.route.params.usedOrExpired) {
                const { available, usedOrExpired } = props.route.params;
                setVouchers({ available, usedOrExpired });
                setFilter({
                    keyword: "",
                    vouchers: usedOrExpired
                });
                setIsLoading(false);
            } else if (props.route.params.customer && !props.route.params.forceUpdate) {
                const { customer } = props.route.params;
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
                    vouchers: usedOrExpired
                });
                setIsLoading(false);
            } else {
                getListVouchers();
            }
        }
    }, [props.route.params]);

    /**
     * send request to get list vouchers
     */
    const getListVouchers = () => {
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
                        vouchers: usedOrExpired
                    });
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * send request to server to reactivate
     */
    const handleReactivateVoucher = () => {
        setModalConfirmation(false);
        let newDate = new Date();
        newDate.setMonth(newDate.getMonth() + 1);
        const data = { expirationDate: newDate.toISOString().slice(0, 10) };
        FetchService.patch(voucherSwiped["@id"], data, user.token)
            .then((result) => {
                if (!!result && result["@id"]) {
                    const newAvailableVouchers = [...vouchers.available, { ...voucherSwiped, expirationDate }];
                    const newUsedVouchers = vouchers.usedOrExpired.filter((voucher) => voucher["@id"] !== voucherSwiped["@id"]);
                    const newVouchers = { available: newAvailableVouchers, usedOrExpired: newUsedVouchers };
                    setVouchers(newVouchers);
                    setFilter({
                        keyword: "",
                        vouchers: newVouchers.usedOrExpired
                    });
                    props.navigation.navigate("Voucher", { screen: "ActifVouchers", params: newVouchers });
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert("Erreur", "Erreur interne du système, veuillez réessayer ultérieurement");
            });
    };

    /**
     * render single voucher
     * @param param0
     * @returns
     */
    const renderItem = ({ item, index }) => {
        const btnText = item.used ? "Utilisé" : "Expiré";
        const btnColors = item.used ? ["#0EE38A", "#A3F8FF"] : ["#8A98BA", "#FFFFFF"];
        const angle = item.used ? 170 : 70;

        const renderContenu = () => (
            <View style={[styles.singleVoucher, { paddingHorizontal: 10 }]}>
                <View style={{ flex: 7 }}>
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
                <View style={{ flex: 3, alignItems: "flex-end" }}>
                    <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textRight, { marginVertical: Platform.OS === "ios" ? 10 : 0 }]}>
                        {item.voucherAmount}€
                    </Text>
                    <LinearGradient
                        style={{ borderRadius: 50, marginTop: 30, paddingVertical: Platform.OS === "ios" ? 4 : 2, width: "100%", maxWidth: 100 }}
                        colors={btnColors}
                        useAngle={true}
                        angle={angle}>
                        <Text style={[styles.fontSofiaMedium, styles.textCenter, styles.textDarkBlue, styles.font16, styles.fontSofiaMedium]}>{btnText}</Text>
                    </LinearGradient>
                </View>
            </View>
        );

        if (item.used) {
            return (
                <View key={item["@id"]} style={{ marginHorizontal: 20 }}>
                    {renderContenu()}
                </View>
            );
        }

        return (
            <SwipeableComponent
                key={item["@id"]}
                index={index}
                data={item}
                title={"Réactiver"}
                handleAction={(voucher) => {
                    setModalConfirmation(true);
                    voucherSwiped = voucher;
                }}>
                {renderContenu()}
            </SwipeableComponent>
        );
    };

    /**
     * handle filter data
     * @param filter
     */
    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newFilteredVouchers = vouchers.usedOrExpired.filter((voucher) => {
            const { voucherAmount, expirationDate, customer } = voucher;
            const expirationDateFormatted = convertDateToDisplay(expirationDate);
            const customerFullName = customer.firstname + " " + customer.lastname;

            return (
                customerFullName.toLowerCase().includes(filterToLower) ||
                customer.firstname.toLowerCase().includes(filterToLower) ||
                customer.lastname.toLowerCase().includes(filterToLower) ||
                customer.email.includes(filterToLower) ||
                voucher["@id"].includes(filterToLower) ||
                voucherAmount.toString().includes(filterToLower) ||
                expirationDateFormatted.toLowerCase().includes(filterToLower)
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
        <SafeAreaViewParent>
            {!props.route.params?.customer || props.route.params?.forceUpdate ? (
                <InputSearch placeholder="Chercher un bon d'achat" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            ) : (
                <View style={{ paddingVertical: 5 }}></View>
            )}
            {filter.vouchers.length > 0 ? (
                <FlatList data={filter.vouchers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
            ) : (
                <Text style={[styles.textCenter, styles.textDarkBlue, styles.font20, styles.fontSofiaMedium, { paddingVertical: 10 }]}>Il n'y a aucun voucher</Text>
            )}
            <ModalConfirmation
                visible={modalConfirmation}
                description={"Êtes-vous sûr de vouloir\nréactiver ce bon\nd’achat ?"}
                handleSubmit={handleReactivateVoucher}
                handleCancel={() => {
                    setModalConfirmation(false);
                    voucherSwiped = null;
                }}
            />
        </SafeAreaViewParent>
    );
};

export default InactifVouchers;
