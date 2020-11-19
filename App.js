/** React */
import React, {useEffect, useState} from 'react';
import {View, ImageBackground, Alert, Platform} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** App */
import LoginPage from './src/page/LoginPage';
import {STORAGE_KEY, STORAGE_USER} from './src/lib/constants';
import LaunchScreen from './src/page/LaunchScreen';
import FlipPage from "./src/page/FlipPage";

const App = () => {
  const [data, setData] = useState({
    showLaunchScreen: true,
    isLogin: false,
    token: null,
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value !== null) {
          setTimeout(() => {
            setData({isLogin: true, token: value, showLaunchScreen: false});
          }, 1500);
        } else {
          setData({
            ...data,
            showLaunchScreen: false,
          });
        }
      } catch (error) {
        console.debug('reading token error');
        Alert.alert(
          'Erreur système',
          'Votre session à expirée, veuillez-vous re-connecter!',
          [{text: 'Se connecter', onPress: () => handleLogout()}],
        );
      }
    };
    getData();
    if (Platform.OS === 'ios') {
      SplashScreen.hide();
    }
  }, []);

  const handleLogin = async (token, data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, token);
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(data));
      setData({isLogin: true, token, showLaunchScreen: false});
    } catch (error) {
      console.debug('save token error', "error");
      Alert.alert('Erreur système', 'Veuillez-vous réessayer!');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(STORAGE_USER);
      setData({isLogin: false, token: null, showLaunchScreen: false});
    } catch (error) {
      console.debug('remove token error');
      setData({isLogin: false, token: null, showLaunchScreen: false});
    }
  };

  return (
    <View style={{flex: 1}}>
      <ImageBackground
        source={require('./src/assets/images/background.png')}
        style={{flex: 1}}
        imageStyle={{
          resizeMode: 'stretch',
        }}>
        {data.showLaunchScreen ? (
          <LaunchScreen />
        ) : data.isLogin ? (
          <FlipPage handleLogout={handleLogout} token={data.token} />
        ) : (
          <LoginPage handleLogin={handleLogin} />
        )}
      </ImageBackground>
    </View>
  );
};

export default App;
