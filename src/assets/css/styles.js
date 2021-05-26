import { StyleSheet } from "react-native";

import { colors } from "../../lib/colors";

export default StyleSheet.create({
    // font family
    fontSofiaSemiBold: {
        fontFamily: "SofiaPro-SemiBold"
    },
    fontSofiaMedium: {
        fontFamily: "SofiaPro-Medium"
    },
    fontSofiaRegular: {
        fontFamily: "SofiaPro-Regular"
    },
    fontSofiaUltraLight: {
        fontFamily: "SofiaPro-UltraLight"
    },
    fontSofiaUltraLightItalic: {
        fontFamily: "SofiaPro-UltraLight-Italic"
    },

    // font size + align + color
    textCenter: {
        textAlign: "center"
    },
    textRight: {
        textAlign: "right"
    },
    textGreen: {
        color: colors.green
    },
    textGray: {
        color: colors.gray
    },
    textMediumGray: {
        color: colors.mediumGray
    },
    textDarkBlue: {
        color: colors.darkBlue
    },
    textWhite: {
        color: colors.white
    },
    font12: {
        fontSize: 12
    },
    font14: {
        fontSize: 14
    },
    font16: {
        fontSize: 16
    },
    font17: {
        fontSize: 17
    },
    font18: {
        fontSize: 18
    },
    font20: {
        fontSize: 20
    },
    font24: {
        fontSize: 24
    },
    font60: {
        fontSize: 60
    },

    // global
    greenScreen: {
        backgroundColor: colors.green
    },
    positionRelative: {
        position: "relative"
    },
    positionAbsolute: {
        position: "absolute"
    },
    flex1: {
        flex: 1
    },
    flex2: {
        flex: 2
    },
    flex3: {
        flex: 3
    },
    flex4: {
        flex: 4
    },
    header: {
        position: "relative",
        textAlign: "center",
        backgroundColor: colors.white,
        paddingVertical: 20
    },
    headerTitle: {
        fontSize: 20,
        textAlign: "center",
        fontFamily: "SofiaPro-Medium"
    },
    backImageBtn: {
        position: "absolute",
        top: 21,
        left: 20,
        zIndex: 1
    },
    backImage: {
        width: 25,
        height: 33.1
    },
    infoImageBtn: {
        position: "absolute",
        top: 24,
        right: 20,
        zIndex: 1
    },
    infoImage: {
        width: 27,
        height: 27
    },
    historyImageBtn: {
        position: "absolute",
        top: 24,
        left: 20,
        zIndex: 1
    },
    historyImage: {
        width: 27,
        height: 27
    },
    mainScreen: {
        width: "100%",
        height: "100%",
        backgroundColor: colors.lightGray,
        position: "relative",
        paddingBottom: 85
    },
    boundImage: {
        width: "100%",
        height: "100%",
        opacity: 0.5,
        resizeMode: "contain"
    },
    thunderImage: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: "100%",
        height: "100%",
        resizeMode: "stretch"
    },
    splashScreen: {
        display: "flex",
        justifyContent: "center",
        alignContent: "center"
    },
    bigLogo: {
        width: 220,
        height: 113
    },
    //input search
    inputContainer: {
        borderRadius: 5,
        borderColor: colors.gray,
        borderWidth: 1,
        position: "relative",
        marginVertical: 10,
        marginHorizontal: 20
    },
    inputSearch: {
        paddingLeft: 40,
        paddingVertical: 10,
        fontSize: 16,
        fontFamily: "SofiaPro-Regular"
    },
    imageSearch: {
        position: "absolute",
        left: 12,
        top: 14,
        width: 20,
        height: 20
    },

    // custom
    logoLoginPage: {
        width: 252,
        height: 129
    },
    divisionHorizontal: {
        width: "100%",
        height: 3
    },

    // Voucher,
    singleVoucher: {
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.gray,
        paddingVertical: 10,
        paddingHorizontal: 20,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        height: 150
    }
});
