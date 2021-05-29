/** React */
import React, { useState } from "react";
import { View, SafeAreaView, Text, FlatList, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/** App */
import ModalConfirmation from "../../components/ModalConfirmation";
import SwipeableComponent from "../../components/SwipeableComponent";
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { convertDateToString, InputSearch } from "../../lib/Helpers";
import { loading } from "../../lib/Helpers";

let voucherSwiped = null;

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

    React.useEffect(() => {
        setIsLoading(true);
        if (props.route.params) {
            if (props.route.params.available && props.route.params.usedOrExpired) {
                const { available, usedOrExpired } = props.route.params;
                setVouchers({ available, usedOrExpired });
                setFilter({
                    keyword: "",
                    vouchers: usedOrExpired
                });
                setIsLoading(false);
            } else if (props.route.params.customer && !props.route.params.fromBottomMenu) {
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
            }
        } else {
            getListVouchers();
        }
    }, [props.route.params]);

    const getListVouchers = () => {
        FetchService.get("/vouchers", user.token)
            .then((result) => {
                if (result && result["hydra:member"] && result["hydra:member"].length > 0) {
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
                Alert.alert("Actif vouchers Error");
            });
    };

    // TODO: modify the voucherSwiped
    const handleReactivateVoucher = () => {
        let newDate = new Date();
        newDate.setMonth(newDate.getMonth() + 1);
        const data = { expirationDate: newDate.toISOString().slice(0, 10) };
        console.log(data);
        FetchService.patch(voucherSwiped["@id"], data, user.token)
            .then((result) => {
                if (!!result) {
                    console.log(result);
                    // const newAvailableVouchers = vouchers.available.push({ ...voucherSwiped, expirationDate});
                    // const newUsedVouchers = vouchers.usedOrExpired.filter((voucher) => voucher["@id"] !== voucherSwiped["@id"]);
                    // props.navigation.navigate("Voucher", { screen: "ActifVouchers", params: { available: newAvailableVouchers, usedOrExpired: newUsedVouchers } });
                }
            })
            .catch((error) => {
                console.error(error);
                // TODO: Change text
                Alert.alert("reactiver voucher error");
            });
    };

    const renderItem = ({ item, index }) => {
        const btnText = item.used ? "Utilisé" : "Expiré";
        const btnColors = item.used ? ["#0EE38A", "#A3F8FF"] : ["#8A98BA", "#FFFFFF"];
        const angle = item.used ? 170 : 70;

        const renderContenu = () => (
            <View style={styles.singleVoucher}>
                <View>
                    <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textDarkBlue]}>{`${item.customer.firstname} ${item.customer.lastname}`}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{item.customer.email}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{item["@id"]}</Text>
                    <Text style={[styles.font16, styles.fontSofiaSemiBold, styles.textMediumGray]}>{convertDateToString(item.expirationDate, true)}</Text>
                </View>
                <View>
                    <Text style={[styles.font20, styles.fontSofiaSemiBold, styles.textDarkBlue, styles.textRight]}>{item.voucherAmount}€</Text>
                    <LinearGradient style={{ borderRadius: 50, width: 100, marginTop: 30, paddingVertical: 2 }} colors={btnColors} useAngle={true} angle={angle}>
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

    const filterData = (filter) => {
        const filterToLower = filter.toLowerCase();
        const newFilteredVouchers = vouchers.usedOrExpired.filter((voucher) => {
            const { voucherAmount, expirationDate, customer } = voucher;
            const expirationDateFormatted = convertDateToString(expirationDate);

            return (
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
        <SafeAreaView style={styles.mainScreen}>
            {props.route.params && props.route.params.fromBottomMenu ? (
                <InputSearch placeholder="Chercher un bon d'achat" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            ) : (
                <View style={{ paddingVertical: 5 }}></View>
            )}
            <FlatList data={filter.vouchers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
            <ModalConfirmation
                visible={modalConfirmation}
                description={"Êtes-vous sûr de vouloir\nréactiver ce bon\nd’achat ?"}
                handleSubmit={handleReactivateVoucher}
                handleCancel={() => {
                    setModalConfirmation(false);
                    voucherSwiped = null;
                }}
            />
        </SafeAreaView>
    );
};

export default InactifVouchers;
