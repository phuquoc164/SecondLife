/** React */
import React, {useState} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/** App */
import {colors} from '../assets/colors';
import FetchService from '../lib/FetchService';
import ResultPage from './ResultPage';

const CameraScan = (props) => {
  const [resultPage, setResultPage] = useState({
    show: false,
    isSuccess: false,
  });

  const handleReadQRCode = (event) => {
    if (event.data) {
      if (props.original === 'scanProduct') {
        props.handleGetReferenceScanned(event.data);
      } else if (props.original === 'scanVoucher') {
        const data = JSON.parse(event.data);
        FetchService.post('vouchers', data, props.token)
          .then((response) => {
            setResultPage({
              show: true,
              isSuccess: response.success,
            });
          })
          .catch((error) => {
            console.debug(error);
            Alert.alert(
              'Problème de système',
              'SecondLife a rencontré une problème. Veuillez re-scanner!',
            );
          });
      }
    }
  };

  const returnScanPage = () => (
    <View style={{position: 'relative', flex: 1}}>
      <View style={{position: 'absolute', top: '45%', right: '45%'}}>
        <ActivityIndicator color={colors.black} size="large" />
      </View>
      <QRCodeScanner
        onRead={handleReadQRCode}
        flashMode={RNCamera.Constants.FlashMode.auto}
        showMarker={true}
        customMarker={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              backgroundColor: 'transparent',
            }}>
            <View
              style={{
                height: 250,
                width: 250,
                borderWidth: 2,
                borderColor: colors.green,
                backgroundColor: 'transparent',
              }}
            />
          </View>
        }
        topViewStyle={{height: 0, flex: 0}}
        bottomViewStyle={{height: 0, flex: 0}}
        cameraStyle={{height: Dimensions.get('screen').height - 90}}
      />
    </View>
  );

  return resultPage.show ? (
    <ResultPage
      isSuccess={resultPage.isSuccess}
      returnHomePage={props.returnHomePage}
      title={
        resultPage.isSuccess
          ? "Ce bon d'achat a bien\nété validé"
          : "Ce bon d'achat a déjà\nété utilisé"
      }
      btnComponent={() => (
        <View style={{flex: 1, alignSelf: 'center'}}>
          <TouchableOpacity
            style={{
              width: 'auto',
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: colors.black,
              borderRadius: 7,
              borderWidth: 1,
              marginTop: 20,
            }}
            onPress={() => {
              setResultPage({
                show: false,
                isSuccess: false,
              });
            }}>
            <Text
              style={{
                fontSize: 19,
                color: colors.white,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              Scanner autre bon d'achat
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  ) : (
    returnScanPage()
  );
};

export default CameraScan;
