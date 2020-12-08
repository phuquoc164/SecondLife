/** React */
import React from 'react';
import {ActivityIndicator, Image, Text, TouchableOpacity, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { colors } from "../assets/colors";

/** App */
import CustomModal from './CustomModal';

const ModalScanner = (props) => (
  <CustomModal
    visible={props.visible}
    containerViewStyle={{alignItems: 'center', position: 'relative'}}>
    <Text style={{fontWeight: 'bold', fontSize: 20, paddingTop: 40}}>
      Scanner une référene
    </Text>
    <TouchableOpacity
      onPress={props.onCancel}
      style={{position: 'absolute', right: 20, top: 20}}>
      <Image
        source={require('../assets/images/cross-black.png')}
        style={{width: 19.5, height: 19}}
      />
    </TouchableOpacity>
    <View style={{position: 'absolute', top: "50%", right: "50%"}}>
      <ActivityIndicator color={colors.black} size='large' />
    </View>
    <QRCodeScanner
      onRead={props.handleScanSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      showMarker={true}
      cameraStyle={{flex: 1, marginTop: -40}}
    />
  </CustomModal>
);

export default ModalScanner;
