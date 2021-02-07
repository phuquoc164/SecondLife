import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../assets/colors";
import Tooltip from 'react-native-walkthrough-tooltip';

const ArgusComponent = (props) => {
  const {labelStyle, inputStyle, name, value, argusTitle, argusPrice, tooltip} = props;
  return (
    <View style={{width: '100%', marginBottom: 10}}>
      <Text style={labelStyle}>
        {name === 'price' ? 'Prix de vente' : "Montant bon d'achat"}
      </Text>
      <TextInput
        style={inputStyle}
        name={name}
        placeholder="0.00 €"
        placeholderTextColor={colors.gray}
        value={value}
        onFocus={() => {
          if (value) {
            const newValue = value.replace(' €', '');
            props.onUpdateData(newValue, name);
          }
        }}
        onBlur={() => {
          if (value) {
            const newValue = (value + ' €').replace(',', '.');
            props.onUpdateData(newValue, name);
          }
        }}
        keyboardType="decimal-pad"
        onChangeText={(newValue) => props.onUpdateData(newValue, name)}
      />

      <View style={{flexDirection: 'row', alignItems: "center", width: "100%", marginTop: 3}}>
        <TouchableOpacity
          style={{marginRight: 5,maxWidth: "90%"}}
          onPress={() => props.handleClickArgus(name)}>
          <Text style={{fontSize: 12, fontStyle: "italic"}}>{argusTitle}</Text>
        </TouchableOpacity>
        {argusPrice && <Text style={{marginRight: 5}}>: {argusPrice} €</Text>}
        <Tooltip
          animated={true}
          // (Optional) When true, tooltip will animate
          // in/out when showing/hiding
          arrowSize={{width: 16, height: 8}}
          // (Optional) Dimensions of arrow bubble pointing to
          // the highlighted element
          backgroundColor="rgba(0,0,0,0.5)"
          // (Optional) Color of the fullscreen background
          isVisible={tooltip.show}
          //(Must) When true, tooltip is displayed
          content={<Text>{tooltip.text}</Text>}
          //(Must) This is the view displayed in the tooltip
          placement="bottom"
          //(Must) top, bottom, left, right, auto.
          onClose={() => props.toggleTooltip(false)}
          //(Optional) Callback fired when the user taps the tooltip
        >
          <TouchableOpacity style={{marginTop: 2}} onPress={() => props.toggleTooltip(true)}>
            <Image
              source={require('../assets/images/question.png')}
              style={{width: 16, height: 16}}
            />
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
};

export default ArgusComponent;
