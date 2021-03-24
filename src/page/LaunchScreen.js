import React from "react";
import { Image, View } from "react-native";

/** App */
import styles from '../assets/css/styles';

const LaunchScreen = () => {
    return (
      <View style={[styles.greenScreen, styles.splashScreen]}>
        <Image
          source={require('../assets/images/Bounds.png')}
          style={styles.boundImage}
        />
        <Image source={require('../assets/images/The-Second-Life-NOIR.png')} style={styles.logoSplashScreen}/>
      </View>
    );
}

export default LaunchScreen;
