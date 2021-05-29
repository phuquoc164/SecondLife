/** React */
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

/** App */
import CustomModal from "./CustomModal";
import styles from "../assets/css/styles";
import { colors } from "../lib/colors";

const ModalPhoto = (props) => (
    <CustomModal visible={props.visible} containerViewStyle={{ width: "80%" }}>
        <Text style={[styles.font17, styles.textDarkBlue, styles.fontSofiaSemiBold, componentStyle.viewContainer]}>Sélectionner une image</Text>
        <TouchableOpacity style={[componentStyle.viewContainer, componentStyle.btnContainer]} onPress={props.handleTakePhoto}>
            <Text style={[styles.font16, styles.textDarkBlue, styles.fontSofiaRegular]}>Prendre une photo</Text>
            <Image source={require("../assets/images/camera.png")} style={{ width: 20, height: 17.5 }} />
        </TouchableOpacity>

        <TouchableOpacity style={[componentStyle.viewContainer, componentStyle.btnContainer]} onPress={props.handleSelectPhoto}>
            <Text style={[styles.font16, styles.textDarkBlue, styles.fontSofiaRegular]}>Depuis la bibliothèque</Text>
            <Image source={require("../assets/images/images.png")} style={{ width: 20, height: 15.6 }} />
        </TouchableOpacity>

        <TouchableOpacity onPress={props.onCancel} style={{ alignItems: "flex-end", padding: 15 }}>
            <Text style={[styles.font16, styles.textDarkBlue, styles.fontSofiaRegular]}>Annuler</Text>
        </TouchableOpacity>
    </CustomModal>
);

const componentStyle = StyleSheet.create({
    viewContainer: {
        padding: 15,
        borderColor: colors.gray,
        borderBottomWidth: 1
    },
    btnContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
});
export default ModalPhoto;
