/** React */
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/** App */
import styles from "../../assets/css/styles";
import FetchService from "../../lib/FetchService";
import { AuthContext } from "../../lib/AuthContext";
import { colors } from "../../lib/colors";
import { validateEmail } from "../../lib/Helpers";

const LoginPage = (props) => {
    const opacityScreen = useRef(new Animated.Value(1)).current;
    const opacityThunder = useRef(new Animated.Value(1)).current;
    const [email, setEmail] = useState({
        value: "",
        error: false,
        opacityLabel: 0
    });
    const [password, setPassword] = useState({
        value: "",
        error: false,
        opacityLabel: 0
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = React.useContext(AuthContext);

    useEffect(() => {
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
    }, []);

    const handleBlurInput = (type) => {
        if (type === "email" && email.value === "") {
            setEmail({ ...email, opacityLabel: 0 });
        } else if (type === "password" && password.value === "") {
            setPassword({ ...password, opacityLabel: 0 });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let error = false;
        if (!validateEmail(email.value)) {
            setEmail({ ...email, error: true });
            error = true;
        }
        if (password.value === "") {
            setPassword({ ...password, error: true });
            error = true;
        }
        if (error) return;
        setIsLoading(true);
        try {
            const resultToken = await FetchService.login(email.value, password.value);
            const profil = await FetchService.get("/users/me", resultToken.token);
            let subscription = "";
            if (!!profil) {
                profil.company.subscriptions.forEach(sub => {
                    if (!sub.expired) {
                        subscription = sub.subscription.name;
                    }
                })
                const user = {
                    token: resultToken.token,
                    firstname: profil.firstname,
                    lastname: profil.lastname,
                    email: profil.email,
                    store: profil.mainStore["@id"],
                    subscription
                };
                signIn(user);
            } else {
                throw Error("Erreur de serveur");
            }
        } catch (error) {
            console.error(error);
            if (error === "401" || error === "404") {
                Alert.alert("Votre email ou votre mot de passe n'est pas correct, veuillez re-essayer!");
            } else {
                Alert.alert("Erreur de serveur", "Veuillez-vous réessayer!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    let titleError = "";
    if (email.error && password.error) {
        titleError = "Merci de renseigner les informations ci-dessus\npour accéder à votre compte.";
    } else if (email.error) {
        titleError = "Merci de renseigner votre email\npour accéder à votre compte.";
    } else if (password.error) {
        titleError = "Merci de renseigner votre mot de passe\npour accéder à votre compte.";
    }

    return (
        <View style={{ backgroundColor: colors.white }}>
            <Animated.View
                style={[
                    styles.positionRelative,
                    stylesLogin.mainScreen,
                    {
                        opacity: opacityScreen.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0]
                        })
                    }
                ]}>
                <View style={[styles.positionRelative, stylesLogin.inputGroup]}>
                    <Text style={[styles.positionAbsolute, styles.fontSofiaRegular, stylesLogin.label, { opacity: email.opacityLabel }]}>Votre email</Text>
                    <Image source={require("../../assets/images/user.png")} style={([styles.positionAbsolute], { width: 12, height: 16, top: 34, left: 15 })} />
                    <TextInput
                        style={[
                            stylesLogin.input,
                            {
                                borderColor: email.error ? "rgba(255, 59, 48, 0.8)" : "rgba(76, 217, 100, 0.8)"
                            }
                        ]}
                        name="email"
                        autoCorrect={false}
                        autoCompleteType="email"
                        autoCapitalize="none"
                        value={email.value}
                        placeholder="exemple@gmail.com"
                        placeholderTextColor="#6A6A6A"
                        onChangeText={(value) => setEmail({ ...email, value })}
                        onFocus={() => setEmail({ ...email, opacityLabel: 1 })}
                        onBlur={() => handleBlurInput("email")}
                    />
                </View>
                <View style={[styles.positionRelative, stylesLogin.inputGroup]}>
                    <Text style={[styles.positionAbsolute, styles.fontSofiaRegular, stylesLogin.label, { opacity: password.opacityLabel }]}>Votre mot de passe</Text>
                    <Image source={require("../../assets/images/password.png")} style={([styles.positionAbsolute], { width: 15, height: 16, top: 34, left: 15 })} />
                    <TouchableOpacity style={[styles.positionAbsolute, { top: 34, right: 15, zIndex: 30 }]} onPress={() => setShowPassword(!showPassword)}>
                        <Image source={require("../../assets/images/eye-pw.png")} style={{ width: 20, height: 16 }} />
                    </TouchableOpacity>
                    <TextInput
                        style={[
                            stylesLogin.input,
                            {
                                borderColor: password.error ? "rgba(255, 59, 48, 0.8)" : "rgba(76, 217, 100, 0.8)"
                            }
                        ]}
                        name="password"
                        autoCorrect={false}
                        autoCompleteType="password"
                        autoCapitalize="none"
                        value={password.value}
                        placeholder="Mot de passe"
                        placeholderTextColor="#6A6A6A"
                        secureTextEntry={!showPassword}
                        onChangeText={(value) => setPassword({ ...password, value })}
                        onFocus={() => setPassword({ ...password, opacityLabel: 1 })}
                        onBlur={() => handleBlurInput("password")}
                    />
                </View>
                {titleError !== "" && <Text style={[styles.fontSofiaRegularn, stylesLogin.error]}>{titleError}</Text>}

                <View>
                    {isLoading ? (
                        <LinearGradient style={stylesLogin.button} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                            <ActivityIndicator color="#171717" />
                        </LinearGradient>
                    ) : (
                        <TouchableOpacity onPress={handleSubmit}>
                            <LinearGradient style={stylesLogin.button} colors={["#0EE38A", "#A3F8FF"]} useAngle={true} angle={170}>
                                <Text style={[styles.fontSofiaMedium, stylesLogin.buttonText]}>Se connecter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={stylesLogin.bottomContainer}>
                    <TouchableOpacity onPress={() => props.navigation.navigate("PasswordForgotten", { title: "Mot de passe oublié ?" })}>
                        <Text style={[styles.fontSofiaRegular, stylesLogin.passwordForgotten, styles.font14, styles.textCenter]}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                    <Text style={[styles.fontSofiaRegular, styles.font14, styles.textCenter]}>Vous n'avez pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => props.navigation.navigate("PasswordForgotten", { title: "Pour vous inscrire, rendez-vous sur" })}>
                        <Text style={[styles.fontSofiaMedium, styles.font14, styles.textCenter]}>Inscrivez-vous</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <Animated.View style={[styles.greenScreen, { opacity: opacityScreen }]}>
                    <Image source={require("../../assets/images/Bounds.png")} style={styles.boundImage} />
                </Animated.View>
                <Animated.Image source={require("../../assets/images/thunder-lighting.png")} style={[styles.thunderImage, { opacity: opacityThunder }]} />
            </View>
            <Animated.View
                style={[
                    stylesLogin.logoContainer,
                    {
                        transform: [
                            {
                                translateY: opacityScreen.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-Dimensions.get("window").height * 0.35, 0]
                                })
                            }
                        ]
                    }
                ]}>
                <Animated.Image
                    source={require("../../assets/images/The-Second-Life-NOIR.png")}
                    style={[
                        styles.logoLoginPage,
                        {
                            transform: [
                                {
                                    scale: opacityThunder.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
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

const stylesLogin = StyleSheet.create({
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        zIndex: 10
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        paddingHorizontal: 5,
        zIndex: 20,
        fontSize: 15,
        top: 2,
        left: 20,
        backgroundColor: colors.white
    },
    input: {
        fontSize: 15,
        width: Dimensions.get("window").width - 40,
        paddingLeft: 40,
        paddingRight: 15,
        paddingVertical: 10,
        borderWidth: 1
    },
    error: {
        color: "#FF3B30",
        textAlign: "center",
        fontSize: 15
    },
    button: {
        borderRadius: 60,
        width: Dimensions.get("window").width - 40,
        paddingVertical: 15,
        marginVertical: 20
    },
    buttonText: {
        fontSize: 20,
        textAlign: "center",
        color: "#171717"
    },
    passwordForgotten: {
        color: "#082FA480",
        marginBottom: 7
    }
});

export default React.memo(LoginPage);
