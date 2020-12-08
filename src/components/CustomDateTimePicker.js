/** React */
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';

/** App */
import CustomModal from './CustomModal';

const maxDate = new Date();
const initialdate = new Date();
initialdate.setFullYear(initialdate.getFullYear() - 18);

const CustomDateTimePicker = (props) => {
  const [date, setDate] = useState(initialdate);

  return (
    <CustomModal
      visible={props.visible}
      containerViewStyle={{padding: 35, alignItems: 'center'}}>
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
    </CustomModal>
  );
};

export default CustomDateTimePicker;
