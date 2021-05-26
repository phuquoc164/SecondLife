/** React */
import React, { useState } from "react";
import { View, SafeAreaView, Text, FlatList } from "react-native";

/** App */
import styles from "../../../assets/css/styles";
import ModalConfirmation from "../../../components/ModalConfirmation";
import SwipeableComponent from "../../../components/SwipeableComponent";
import { AuthContext } from "../../../lib/AuthContext";
import { colors } from "../../../lib/colors";
import { convertDateToString, InputSearch } from "../../../lib/Helpers";

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

    const { customer } = props.route.params;
    const { token } = React.useContext(AuthContext);
    

    React.useEffect(() => {
        if (props.route.params?.customer) {
            const { customer } = props.route.params;
            setVouchers({ available: customer.availableVouchers, usedOrExpired: customer.vouchers });
            setFilter({
                keyword: "",
                vouchers: customer.availableVouchers
            });
        }
    }, [props.route.params]);

    handleMaskAsUsedVoucher = () => {
        console.log(voucherSwiped);
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
                    <Text style={[styles.font24, styles.fontSofiaSemiBold, styles.textDarkBlue]}>{`${customer.firstname} ${customer.lastname}`}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{customer.email}</Text>
                    <Text style={[styles.font16, styles.fontSofiaMedium, styles.textDarkBlue]}>{item["@id"]}</Text>
                    <Text style={[styles.font16, styles.fontSofiaSemiBold, styles.textMediumGray]}>{convertDateToString(item.expirationDate, true)}</Text>
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
            const { voucherAmount, expirationDate } = voucher;
            const expirationDateFormatted = convertDateToString(expirationDate);
            console.log(voucherAmount, expirationDateFormatted, filterToLower);

            return voucher["@id"].includes(filterToLower) || voucherAmount.toString().includes(filterToLower) || expirationDateFormatted.toLowerCase().includes(filterToLower);
        });
        setFilter({
            keyword: filter,
            vouchers: newFilteredVouchers
        });
    };

    return (
        <SafeAreaView style={styles.mainScreen}>
            <InputSearch placeholder="Chercher un bon d'achat" placeholderTextColor={colors.lightBlue} value={filter.keyword} filterData={filterData} />
            <FlatList data={filter.vouchers} renderItem={renderItem} keyExtractor={(item) => item["@id"]} />
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
