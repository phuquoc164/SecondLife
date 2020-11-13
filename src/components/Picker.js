/** React */
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PickerModal from 'react-native-picker-modal-view';

/** App */
import {colors} from '../assets/colors';
import { categoryIcons } from "../lib/constants";

const Picker = (props) => {
  const renderSelectView = (showModal, typeData, labelNoSelect) => (
    <View style={{position: 'relative'}}>
      <TouchableOpacity
        style={{
          ...styles.input,
          borderColor: !props.showError || typeData ? colors.gray : colors.red,
        }}
        onPress={showModal}>
        <Text
          style={{
            color: typeData ? colors.black : colors.gray,
          }}>
          {typeData ? typeData.Name : labelNoSelect}
        </Text>
      </TouchableOpacity>
      <Image
        source={require('../assets/images/chevron-down.png')}
        style={styles.imageChevronDown}
      />
    </View>
  );

  const renderListItem = (defaultSelected, item) => {
    if (item.Id === 'no_data') {
      return (
        <View style={{...styles.styleListItem, borderBottomWidth: 0}}>
          <Text style={{textAlign: 'center'}}>{item.Name}</Text>
        </View>
      );
    }
    return (
      <View style={styles.styleListItem}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            {item.HasImage && (
              <View style={{width: 32, alignItems: 'center', marginRight: 10}}>
                <Image
                  source={categoryIcons[item.Name].uri}
                  style={{
                    width: categoryIcons[item.Name].width,
                    height: categoryIcons[item.Name].height,
                  }}
                />
              </View>
            )}

            <Text
              style={{
                fontWeight:
                  defaultSelected && defaultSelected.Name === item.Name
                    ? 'bold'
                    : 'normal',
              }}>
              {item.Name}
            </Text>
          </View>
          <Image
            source={require('../assets/images/chevron-left.png')}
            style={{width: 9, height: 13.5}}
          />
        </View>
      </View>
    );
  };

  const renderSearch = (handleClose) => (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 20,
        position: 'relative',
      }}>
      <Text style={styles.label}>{props.titleSearch}</Text>
      <TouchableOpacity
        onPress={handleClose}
        style={{position: 'absolute', right: 10, top: 10}}>
        <Image
          source={require('../assets/images/cross-black.png')}
          style={{width: 19.5, height: 19}}
        />
      </TouchableOpacity>
    </View>
  );
  if (props.renderSearch) {
    return (
      <PickerModal
        renderSelectView={(disabled, selected, showModal) =>
          renderSelectView(showModal, props.dataSelected, props.placeholder)
        }
        onSelected={(selected) => {
          if (Object.keys(selected).length > 0) {
            props.onSelected(selected);
          }
        }}
        items={props.items}
        selected={props.dataSelected}
        autoGenerateAlphabeticalIndex={props.autoGenerateAlphabeticalIndex}
        showAlphabeticalIndex={props.showAlphabeticalIndex}
        requireSelection={true}
        renderListItem={renderListItem}
        renderSearch={renderSearch}
      />
    );
  }
  
  return (
    <PickerModal
      renderSelectView={(disabled, selected, showModal) =>
        renderSelectView(showModal, props.dataSelected, props.placeholder)
      }
      onSelected={(selected) => {
        if (Object.keys(selected).length > 0) {
          props.onSelected(selected);
        }
      }}
      items={props.items}
      selected={props.dataSelected}
      autoGenerateAlphabeticalIndex={props.autoGenerateAlphabeticalIndex}
      showAlphabeticalIndex={props.showAlphabeticalIndex}
      requireSelection={true}
      renderListItem={renderListItem}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  imageChevronDown: {
    width: 14,
    height: 9,
    position: 'absolute',
    right: 0,
    bottom: 8,
  },
  styleListItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  label: {
    color: colors.gray,
    fontWeight: '500',
    marginBottom: 5,
  },
});

export default Picker;
