/** React */
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";

/** App */
import CustomModal from "./CustomModal";
import styles from "../assets/css/styles";

const maxDate = new Date();

const CustomDateTimePicker = (props) => {
    const [date, setDate] = useState(props.date);

    return (
        <CustomModal visible={props.visible} containerViewStyle={{ padding: 35, alignItems: "center" }}>
            <DatePicker locale="fr" date={date} format="DD/MM/YYYY" maximumDate={maxDate} mode="date" onDateChange={(date) => setDate(date)} />

            <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                    style={[styles.greenScreen, { width: "100%", paddingHorizontal: 50, paddingVertical: 6, borderRadius: 20, marginBottom: 10 }]}
                    onPress={() => props.onValidate(date)}
				>
                    <Text style={[styles.textWhite, styles.fontSofiaMedium, styles.font24, styles.textCenter]}>Confirmer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onCancel}>
                    <Text style={[styles.textGreen, styles.fontSofiaMedium, styles.font24, styles.textCenter]}>Annuler</Text>
                </TouchableOpacity>
            </View>
        </CustomModal>
    );
};

export default CustomDateTimePicker;
