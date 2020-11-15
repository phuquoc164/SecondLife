import React, {useState} from 'react';
import {
    Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../assets/colors';
import FetchService from "../lib/FetchService";

const ListProducts = (props) => {
  const [showList, setShowList] = useState('haventSold');
  const [showMore, setShowMore] = useState(null);

  const toggleItem = (sku) => {
    if (showMore === sku) {
      setShowMore(null);
    } else {
      setShowMore(sku);
    }
  };

  const handleSellProduct = (uri) => {
    FetchService.delete(uri, props.token).then(response => {
        if (response.success) {
            props.updateListProducts(uri);
        } else {
            Alert.alert("Problème de API", "Une problème est survenue. Veuillez reéssayer!");
        }
    }).catch(error => {
        console.debug(error);
        Alert.alert(
          'Problème de API',
          'Une problème est survenue. Veuillez reéssayer!',
        );
    })
  };

  const renderItem = (item) => {
    let styleItemShowed = {};
    if (showMore === item.sku) {
      styleItemShowed = {
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
        paddingBottom: 10,
        marginBottom: 10,
      };
    }
    return (
      <View key={item.sku} style={styles.item}>
        <TouchableOpacity
          onPress={() => toggleItem(item.sku)}
          style={{...styles.btnItem, ...styleItemShowed}}>
          <Text
            style={{
              fontWeight: showMore === item.sku ? 'bold' : 'normal',
            }}>{`${item.name} - ${item.firstName} ${item.lastName}`}</Text>
          {showMore === item.sku ? (
            <Image
              source={require('../assets/images/chevron-down.png')}
              style={{width: 14, height: 9}}
            />
          ) : (
            <Image
              source={require('../assets/images/chevron-left.png')}
              style={{width: 9, height: 13.5}}
            />
          )}
        </TouchableOpacity>
        {showMore === item.sku && (
          <View>
            <Text>- Information Générale</Text>
            <View style={{paddingLeft: 20, marginBottom: 10}}>
              <Text>{`Prénom: ${item.firstName}`}</Text>
              <Text>{`Nom: ${item.lastName}`}</Text>
              <Text>{`Email: ${item.email}`}</Text>
              <Text>{`Phone: ${item.phone}`}</Text>
            </View>
            <Text>- Article</Text>
            <View style={{paddingLeft: 20}}>
              <Text>{`Name: ${item.name}`}</Text>
              <Text>{`Marque: ${item.brand}`}</Text>
              <Text>{`Prix: ${item.price} €`}</Text>
              <Text>{`Créé: ${item.createdDate.split(' ')[0]}`}</Text>
            </View>
            {!item.sold && (
              <View style={{alignSelf: 'center', marginTop: 20}}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => handleSellProduct(item.uri)}>
                  <Text style={styles.btnText}>A vendu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderProductsSold = () => (
    <View style={styles.styleListItem}>
      {props.listProductsSold.map((product) => renderItem(product))}
    </View>
  );

  const renderProductsHaventSold = () => (
    <View style={styles.styleListItem}>
      {props.listProductsHaventSold.map((product) => renderItem(product))}
    </View>
  );

  const title = showList === 'haventSold' ? "List produits à vendre" : "List produits vendus";

  return (
    <SafeAreaView style={{width: '100%', height: '100%', position: 'relative'}}>
      <ScrollView style={{marginBottom: 50}}>
        <View
          style={{
            justifyContent: 'center',
            paddingVertical: 20,
            position: "relative"
          }}>
          <Text style={styles.label}>{title}</Text>
          <TouchableOpacity
            onPress={props.flipCard}
            style={{position: 'absolute', right: 10, top: 10}}>
            <Image
              source={require('../assets/images/cross-black.png')}
              style={{width: 19.5, height: 19}}
            />
          </TouchableOpacity>
        </View>
        {showList === 'haventSold'
          ? renderProductsHaventSold()
          : renderProductsSold()}
      </ScrollView>
      <View style={styles.menuBottom}>
        <TouchableOpacity
          style={{
            ...styles.btnMenuBottom,
            backgroundColor:
              showList === 'haventSold' ? colors.white : colors.black,
          }}
          onPress={() => setShowList('haventSold')}
          disabled={showList === 'haventSold'}>
          <Text
            style={{
              ...styles.btnText,
              color: showList === 'haventSold' ? colors.black : colors.white,
            }}>
            à vendre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.btnMenuBottom,
            backgroundColor:
              showList === 'sold' ? colors.white : colors.black,
          }}
          onPress={() => setShowList('sold')}
          disabled={showList === 'sold'}>
          <Text
            style={{
              ...styles.btnText,
              color: showList === 'sold' ? colors.black : colors.white,
            }}>
            A vendu
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  styleListItem: {
    padding: 15,
    backgroundColor: colors.white,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    paddingVertical: 15,
  },
  btnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.black,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 5,
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.black,
    borderRadius: 7,
    borderWidth: 1,
  },
  btnText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  menuBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.black,
  },
  btnMenuBottom: {
    paddingVertical: 15,
    width: '50%',
  },
});

export default ListProducts;
