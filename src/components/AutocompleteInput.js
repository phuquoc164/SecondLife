/** React */
import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** App */
import {colors} from '../lib/colors';

const AutocompleteInput = (props) => {
  const numberOptions = props.options.length;
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [inputRef, setInputRef] = useState(null);

  const renderItem = (item, index) => {
    return (
      <TouchableOpacity
        style={{
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderColor: colors.gray,
          borderBottomWidth: index === `${numberOptions - 1}` ? 0 : 1,
        }}
        onPress={() => {
          inputRef.blur();
          props.onChangeText(item);
          props.handleAutocomplete && props.handleAutocomplete();
          setShowSuggestions(false);
        }}
        key={index}>
        <Text
          style={{
            backgroundColor: colors.white,
          }}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={props.containerStyle}>
      <Text style={props.labelStyle}>{props.label}</Text>
      <View style={{position: 'relative'}}>
        <TextInput
					ref={ref => setInputRef(ref)}
          style={props.inputStyle}
          placeholder={props.placeholder}
          placeholderTextColor={colors.gray}
          onFocus={() => {
            setShowSuggestions(true);
            props.onFocus();
          }}
          onBlur={() => {
            setShowSuggestions(false);
            props.onBlur();
						props.handleAutocomplete && props.handleAutocomplete();
					}}
          value={props.value}
          onChangeText={(data) => props.onChangeText(data)}
					autoCapitalize={props.autoCapitalize ? props.autoCapitalize : "words"}
					keyboardType={props.keyboardType ? props.keyboardType : "default"}
        />
        {showSuggestions && numberOptions > 0 && (
          <SafeAreaView
            style={{
              backgroundColor: colors.white,
              borderColor: colors.gray,
              borderWidth: 1,
              borderTopWidth: 0,
              position: 'absolute',
              top: 30,
              left: 0,
              zIndex: 200,
              maxHeight: 180,
              width: '100%',
            }}>
            {props.options.map((option, index) => renderItem(option, index))}
          </SafeAreaView>
        )}
      </View>
    </View>
  );
};

export default AutocompleteInput;
