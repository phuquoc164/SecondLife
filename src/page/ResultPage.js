/** React */
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const ResultPage = (props) => {
  let className = 'imageCheck';
  let icon = require('../assets/images/check.png');
  if (!props.isSuccess) {
    icon = require('../assets/images/cross.png');
    className = 'imageCross';
  }
  return (
    <View style={styles.mainScreen}>
      <TouchableOpacity
        onPress={props.returnHomePage}
        style={{position: 'absolute', right: 20, top: 20}}>
        <Image
          source={require('../assets/images/cross-black.png')}
          style={{width: 19.5, height: 19}}
        />
      </TouchableOpacity>
      <View style={{flex: 1, width: '65%', maxWidth: 300}}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
          }}
        />
      </View>
      <View
        style={{
          flex: 3,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{props.title}</Text>
        </View>
        <View style={{flex: 1, width: '100%', alignSelf: 'center'}}>
          <Image source={icon} style={styles[className]} />
        </View>
        {props.btnComponent && props.btnComponent()}
      </View>
      {props.havebtnDeconnecte && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={props.handleLogout}>
            <Text style={styles.btnDeconnecte}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainScreen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 45,
    paddingTop: 25,
    position: "relative"
  },
  title: {
    flex: 1,
    fontSize: 25,
    textAlign: 'center',
  },
  imageCross: {
    width: 90,
    height: 90,
  },
  imageCheck: {
    width: 120,
    height: 100,
  },
  btnDeconnecte: {
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
});

export default ResultPage;
