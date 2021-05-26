/** React */
import React from "react";
import { Modal, View } from "react-native";

/** App */
import { colors } from "../lib/colors";

const CustomModal = (props) => (
    <Modal transparent={true} animationType="slide" visible={props.visible}>
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0, 0.8)"
            }}>
            <View
                style={{
                    margin: 20,
                    backgroundColor: colors.white,
                    borderRadius: 2,
                    shadowColor: colors.black,
                    shadowOffset: {
                        width: 0,
                        height: 2
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    ...props.containerViewStyle
                }}>
                {props.children}
            </View>
        </View>
    </Modal>
);

export default CustomModal;
