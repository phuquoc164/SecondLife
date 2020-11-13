/** React */
import React, {useState} from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';

/** App */
import { colors } from "../assets/colors";

const maxDate = new Date();
const initialdate = new Date();
initialdate.setFullYear(initialdate.getFullYear() - 18);

const CustomDateTimePicker = (props) => {
  const [date, setDate] = useState(initialdate);

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
            padding: 35,
            alignItems: 'center',
            shadowColor: colors.black,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <DatePicker
            locale="fr"
            date={date}
            maximumDate={maxDate}
            mode={props.mode}
            onDateChange={(date) => setDate(date)}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 20,
            }}>
            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={props.onCancel}>
              <Text style={{fontSize: 15}}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => props.onValidate(date)}>
              <Text style={{fontSize: 15}}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDateTimePicker;
