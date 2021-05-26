/** React */
import React, { useRef, useEffect } from "react";
import { Text, Animated, Easing, View, Dimensions, StyleSheet, Image, TouchableOpacity } from "react-native";

/** App */
import styles from "../assets/css/styles";
import { AuthContext } from "../lib/AuthContext";

const HomeScreen = (props) => {
    const opacityScreen = useRef(new Animated.Value(1)).current;
    const opacityThunder = useRef(new Animated.Value(1)).current;
    const { fromLogin } = React.useContext(AuthContext);

    useEffect(() => {
        if (!fromLogin && !props.route.params) {
            Animated.sequence([
                Animated.timing(opacityScreen, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear(),
                    useNativeDriver: true
                }),

                Animated.timing(opacityThunder, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear(),
                    useNativeDriver: true
                })
            ]).start();
        }
    }, []);

    const mainView = () => (
        <>
            <TouchableOpacity onPress={() => props.navigation.navigate("NewProduct", { screen: "NewCustomer" })} style={componentStyles.newLifer}>
                <Image source={require("../assets/images/new-lifer.png")} style={{ width: "100%", resizeMode: "contain", top: -Dimensions.get("window").height * 0.38 }} />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => props.navigation.navigate("NewProduct", { screen: "ListCustomersAddProduct", params: { addProduct: true } })}
                style={componentStyles.lifer}>
                <Image source={require("../assets/images/lifer.png")} style={{ width: "100%", resizeMode: "contain", top: -Dimensions.get("window").height * 0.38 }} />
            </TouchableOpacity>
        </>
    );

    if (fromLogin || props.route.params) {
        return (
            <View style={[styles.positionRelative, componentStyles.mainScreen, styles.greenScreen, { alignItems: "center", justifyContent: "center" }]}>
                <Image source={require("../assets/images/The-Second-Life-NOIR.png")} style={{ width: 176.4, height: 90.3, top: -Dimensions.get("window").height * 0.38 }} />
                {mainView()}
            </View>
        );
    }

    return (
        <View style={styles.greenScreen}>
            <Animated.View
                style={[
                    styles.positionRelative,
                    componentStyles.mainScreen,
                    {
                        opacity: opacityScreen.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0]
                        }),
                        alignItems: "center"
                    }
                ]}>
                {mainView()}
            </Animated.View>

            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <Animated.View style={[styles.greenScreen, { opacity: opacityScreen }]}>
                    <Image source={require("../assets/images/Bounds.png")} style={styles.boundImage} />
                </Animated.View>
                <Animated.Image source={require("../assets/images/thunder-lighting.png")} style={[styles.thunderImage, { opacity: opacityThunder }]} />
            </View>
            <Animated.View
                style={[
                    componentStyles.logoContainer,
                    {
                        transform: [
                            {
                                translateY: opacityScreen.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-Dimensions.get("window").height * 0.36, 0]
                                })
                            }
                        ]
                    }
                ]}>
                <Animated.Image
                    source={require("../assets/images/The-Second-Life-NOIR.png")}
                    style={[
                        styles.logoLoginPage,
                        {
                            transform: [
                                {
                                    scale: opacityThunder.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.7, 1]
                                    })
                                }
                            ]
                        }
                    ]}
                />
            </Animated.View>
        </View>
    );
};

const componentStyles = StyleSheet.create({
    logoContainer: {
        position: "absolute",
        top: 280,
        bottom: 280,
        right: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 0
    },
    mainScreen: {
        height: "100%",
        width: "100%",
        zIndex: 10
    },
    newLifer: {
        width: "49%",
        position: "absolute",
        height: Dimensions.get("window").height / 2.5,
        top: Dimensions.get("window").height * 0.22,
        left: 5
    },
    lifer: {
        width: "49%",
        position: "absolute",
        height: Dimensions.get("window").height / 2.5,
        bottom: Dimensions.get("window").height * 0.2,
        right: 5
    }
});

export default React.memo(HomeScreen);
