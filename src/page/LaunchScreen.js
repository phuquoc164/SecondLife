import React from "react";
import { Image, View } from "react-native";

const LaunchScreen = () => {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            flex: 1,
            width: '70%',
            resizeMode: 'contain',
          }}
        />
      </View>
    );
}

export default LaunchScreen;