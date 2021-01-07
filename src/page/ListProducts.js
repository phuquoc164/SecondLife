/** React */
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';

/** App */
import {colors} from '../assets/colors';
import ModalProduct from '../components/ModalProduct';
import ModalConfirmation from '../components/ModalConfirmation';
import SwipeableComponent from '../components/SwipeableComponent';
import FetchService from '../lib/FetchService';

let productSwiped = null;

const ListProducts = (props) => {
  const [showList, setShowList] = useState('haventsold');
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [productDetail, setProductDetail] = useState({
    modal: false,
    product: null,
  });

  useEffect(() => {
    if (!props.productModified && productDetail.modal) {
      setProductDetail({modal: false, product: null});
    } else if (props.productModified && !productDetail.modal) {
      setProductDetail({modal: true, product: props.productModified});
    }
  }, [props.productModified]);

  useEffect(() => {
    if (!!props.referenceScanned) {
      const listProducts = [...props.listProductsHaventSold, ...props.listProductsSold];

      const index = listProducts.findIndex((product) => product.sku === props.referenceScanned);
      if (index !== -1) {
        listProducts[index].product.sold ? setShowList("sold") : setShowList("haventsold");
        setProductDetail({
          modal: true,
          product: listProducts[index],
        });
      } else {
        Alert.alert(
          'Erreur système',
          'SecondLife ne peut pas trouver votre produit. Veuillez réessayer ou chercher dans la liste des produits',
        );
      }
      props.resetReferenceScanned();
    }
  }, [props.referenceScanned]);

  /** send request to sell Product */
  const handleSellProduct = (item) => {
    FetchService.delete(item.uri, props.token)
      .then((response) => {
        if (response.success) {
          props.updateListProducts(item.uri, 'sold');
        } else {
          Alert.alert(
            'Erreur système',
            'SecondLife rencontre une erreur, veuillez réessayer plus tard.',
          );
        }
      })
      .catch((error) => {
        console.debug(error);
        setTimeout(() => {
          Alert.alert(
            'Erreur système',
            'SecondLife rencontre une erreur, veuillez réessayer plus tard.',
          );
        }, 100);
      });
  };

  /** send request to unsell product */
  const handleUnsellProduct = (item) => {
    FetchService.patch(item.uri, {products: [{sold: 0}]}, props.token)
      .then((response) => {
        if (response.success) {
          props.updateListProducts(item.uri, 'haventsold');
        } else {
          Alert.alert(
            'Erreur système',
            'SecondLife rencontre une erreur, veuillez réessayer plus tard.',
          );
        }
      })
      .catch((error) => {
        console.debug(error);
        Alert.alert(
          'Erreur système',
          'SecondLife rencontre une erreur, veuillez réessayer plus tard.',
        );
      });
  };

  /** hide the modal and set the detail product null */
  const handleSelectProduct = (item) => {
    setProductDetail({
      modal: true,
      product: item,
    });
  };

  const renderItem = ({item, type}) => {
    return (
      <RectButton
        style={[styles.item, {opacity: type === 'sold' ? 0.4 : 1}]}
        key={item.sku}
        onPress={() => handleSelectProduct(item)}>
        <View style={{width: 80, height: 80}}>
          <TouchableOpacity
            onPress={() => handleSelectProduct(item)}
            style={{flex: 1}}>
            <Image
              source={{
                uri:
                  'data:image/png;base64,' + item.product.pictures[0].content,
              }}
              style={{width: '100%', height: '100%', resizeMode: 'cover'}}
            />
          </TouchableOpacity>
        </View>
        <View style={{paddingHorizontal: 20}}>
          <Text style={styles.productTitle}>{item.product.name}</Text>
          <Text style={styles.productSubtitle}>
            {item.product.brand} -{' '}
            <Text style={{fontWeight: 'bold'}}>{item.product.price} €</Text>
          </Text>
          <Text style={styles.productSubtitle}>{`${item.customer.firstName} ${
            item.customer.lastName
          } - ${item.product.createdDate
            .split(' ')[0]
            .replace(/-/g, '.')}`}</Text>
        </View>
      </RectButton>
    );
  };

  const renderNoItem = () => (
    <View style={{flex: 3}}>
      <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 24}}>
        Il n'y a aucun produits
      </Text>
    </View>
  );

  const renderProductsSold = () =>
    props.listProductsSold.length > 0 ? (
      <SafeAreaView style={{flex: 3}}>
        <FlatList
          data={props.listProductsSold}
          renderItem={({item, index}) => (
            <SwipeableComponent
              key={index}
              index={index}
              data={item}
              type="sold"
              handleUnsellProduct={handleUnsellProduct}>
              {renderItem({item, type: 'sold'})}
            </SwipeableComponent>
          )}
          keyExtractor={(item) => item.sku}
        />
      </SafeAreaView>
    ) : (
      renderNoItem()
    );

  const renderProductsHaventSold = () =>
    props.listProductsHaventSold.length > 0 ? (
      <SafeAreaView style={{flex: 3}}>
        <FlatList
          data={props.listProductsHaventSold}
          renderItem={({item, index}) => (
            <SwipeableComponent
              key={index}
              index={index}
              data={item}
              type="haventsold"
              handleSellProduct={(product) => {
                setModalConfirmation(true);
                productSwiped = product;
              }}
              handleModifyProduct={props.handleModifyProduct}>
              {renderItem({item, type: 'haventsold'})}
            </SwipeableComponent>
          )}
          keyExtractor={(item) => item.sku}
        />
      </SafeAreaView>
    ) : (
      renderNoItem()
    );

  return (
    <SafeAreaView
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: colors.white,
      }}>
      {/* Top Menu*/}
      <View style={styles.menuTop}>
        {/* Button à vender */}
        <TouchableOpacity
          style={{
            ...styles.btnMenuTop,
            borderBottomWidth: showList === 'haventsold' ? 1 : 0,
          }}
          onPress={() => setShowList('haventsold')}
          disabled={showList === 'haventsold'}>
          <Text
            style={{
              ...styles.btnText,
              color: showList === 'haventsold' ? colors.black : colors.gray,
            }}>
            à vendre
          </Text>
        </TouchableOpacity>
        {/* Button vendu */}
        <TouchableOpacity
          style={{
            ...styles.btnMenuTop,
            borderBottomWidth: showList === 'sold' ? 1 : 0,
          }}
          onPress={() => setShowList('sold')}
          disabled={showList === 'sold'}>
          <Text
            style={{
              ...styles.btnText,
              color: showList === 'sold' ? colors.black : colors.gray,
            }}>
            Vendu
          </Text>
        </TouchableOpacity>
      </View>
      {showList === 'haventsold'
        ? renderProductsHaventSold()
        : renderProductsSold()}
      <View style={{marginBottom: 60}}></View>
      <ModalProduct
        visible={productDetail.modal}
        product={productDetail.product}
        handleModifyProduct={() =>
          props.handleModifyProduct(productDetail.product)
        }
        handleSellProduct={() => {
          handleSellProduct(productDetail.product);
          setProductDetail({
            modal: false,
            product: null,
          });
        }}
        handleUnsellProduct={() => {
          handleUnsellProduct(productDetail.product);
          setProductDetail({modal: false, product: null});
        }}
        goBack={() => setProductDetail({modal: false, product: null})}
      />
      <ModalConfirmation
        visible={modalConfirmation}
        handleSubmit={() => {
          handleSellProduct(productSwiped);
          setModalConfirmation(false);
          productSwiped = null;
        }}
        handleCancel={() => setModalConfirmation(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 80,
  },
  productTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: colors.black,
  },
  productSubtitle: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  btnText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  menuTop: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  btnMenuTop: {
    paddingVertical: 15,
    flex: 1,
    borderBottomColor: colors.black,
  },
});

export default ListProducts;
