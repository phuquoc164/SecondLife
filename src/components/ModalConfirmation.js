/** React */
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import styles from "../assets/css/styles";

/** App */
import CustomModal from "./CustomModal";

const ModalConfirmation = (props) => (
    <CustomModal
        visible={props.visible}
        containerViewStyle={{
            width: "90%",
            borderRadius: 10,
            paddingHorizontal: 10
        }}>
        <Text style={[styles.fontSofiaMedium, styles.font24, styles.textCenter, styles.textDarkBlue, { marginTop: 20 }]}>Psss... Pas si vite!</Text>
        <Text style={[styles.font60, styles.textCenter, { paddingVertical: 15 }]}>✋</Text>
        <Text style={[styles.fontSofiaMedium, styles.font24, styles.textCenter, styles.textDarkBlue]}>{props.description}</Text>
        <TouchableOpacity
            onPress={props.handleSubmit}
            style={[styles.greenScreen, { borderRadius: 10, marginHorizontal: 30, paddingBottom: 10, paddingTop: Platform.OS === "ios" ? 15 : 10, marginTop: 20 }]}>
            <Text style={[styles.textWhite, styles.fontSofiaMedium, styles.font24, styles.textCenter]}>Confirmer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.handleCancel} style={{ marginVertical: 20 }}>
            <Text style={[styles.textGreen, styles.fontSofiaMedium, styles.font24, styles.textCenter]}>Annuler</Text>
        </TouchableOpacity>
    </CustomModal>
);

export default ModalConfirmation;
