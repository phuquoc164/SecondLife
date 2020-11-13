/** React */
import React from 'react';
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/** App */
import {colors} from '../assets/colors';

const ModalPhoto = (props) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={props.visible}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 22,
        }}>
        <View
          style={{
            margin: 20,
            backgroundColor: colors.white,
            borderRadius: 2,
            width: '80%',
            shadowColor: colors.black,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <View
            style={{
              padding: 15,
              borderColor: colors.gray,
              borderBottomWidth: 1,
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              Sélectionner une image
            </Text>
          </View>
          <View
            style={{
              padding: 15,
              borderColor: colors.gray,
              borderBottomWidth: 1,
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              onPress={props.handleTakePhoto}>
              <Text style={{color: colors.black}}>Prendre une photo</Text>
              <Image
                source={require('../assets/images/camera.png')}
                style={{width: 20, height: 17.5}}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              padding: 15,
              borderColor: colors.gray,
              borderBottomWidth: 1,
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              onPress={props.handleSelectPhoto}>
              <Text style={{color: colors.black}}>Depuis la bibliothèque</Text>
              <Image
                source={require('../assets/images/images.png')}
                style={{width: 20, height: 15.6}}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={props.onCancel}
            style={{alignItems: 'flex-end', padding: 15}}>
            <Text>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalPhoto;
