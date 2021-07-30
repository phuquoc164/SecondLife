/** React */
import React from "react";
import { Animated, Text, View } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import styles from "../assets/css/styles";

/** App */
import { colors } from "../lib/colors";

let row = [];
let prevOpenedRow;

const SwipeableComponent = (props) => {
    const renderAction = (text, color, x, progress, onPress) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0]
        });
        return (
            <Animated.View style={{ flex: 1, marginLeft: -30, transform: [{ translateX: trans }] }}>
                <RectButton
                    style={{
                        backgroundColor: colors.green,
                        alignItems: "center",
                        flex: 1,
                        justifyContent: "center",
                        borderRadius: 20
                    }}
                    onPress={() => {
                        prevOpenedRow.close();
                        prevOpenedRow = null;
                        onPress();
                    }}>
                    <Text style={[styles.font24, styles.fontSofiaRegular, styles.textWhite, styles.textCenter, { paddingLeft: 30, lineHeight: 33 }]}>{text}</Text>
                </RectButton>
            </Animated.View>
        );
    };

    const renderActions = (progress) => (
        <View
            style={{
                width: 150,
                height: 150,
                flexDirection: "row"
            }}>
            {renderAction(props.title, colors.green, 80, progress, () => props.handleAction(props.data))}
        </View>
    );

    return (
        <Swipeable
            ref={(ref) => (row[props.index] = ref)}
            friction={2}
            leftThreshold={30}
            renderRightActions={renderActions}
            onSwipeableWillOpen={() => {
                if (prevOpenedRow && prevOpenedRow !== row[props.index]) {
                    prevOpenedRow.close();
                }
                prevOpenedRow = row[props.index];
            }}
			containerStyle={{marginHorizontal: 20}}>
            {props.children}
        </Swipeable>
    );
};

export default SwipeableComponent;
