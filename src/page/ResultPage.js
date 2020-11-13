/** React */
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

/** App */
import {colors} from '../assets/colors';

const ResultPage = (props) => {
  let title = 'Votre article à été\najouté avec succès !';
  let className = 'imageCheck';
  let icon = require('../assets/images/check.png');
  let btnText = '+ Ajouter un autre article';
  let btnStyle = {paddingVertical: 15};
  if (!props.isSuccess) {
    title = "Votre article n'a pas pu\nêtre ajouté ...";
    icon = require('../assets/images/cross.png');
    className = 'imageCross';
    btnText = 'Réessayer';
    btnStyle = {paddingVertical: 10};
  }
  return (
    <View style={styles.mainScreen}>
      <View style={{flex: 1, width: '80%'}}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
            marginTop: -25,
          }}
        />
      </View>
      <View
        style={{
          flex: 2,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={{flex: 1, width: '100%', alignSelf: 'center'}}>
          <Image source={icon} style={styles[className]} />
        </View>
        <View style={{flex: 1, alignSelf: 'center'}}>
          <TouchableOpacity
            style={{...styles.button, ...btnStyle}}
            onPress={props.handleAddOtherArticle}>
            <Text
              style={{
                ...styles.buttonText,
                fontSize: btnText === 'Réessayer' ? 25 : 20,
              }}>
              {btnText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={props.handleLogout}>
          <Text style={styles.btnDeconnecte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainScreen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 45,
  },
  title: {
    flex: 1,
    fontSize: 30,
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
  button: {
    paddingHorizontal: 20,
    backgroundColor: colors.black,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 35,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnDeconnecte: {
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
});

export default ResultPage;
