/** React */
import React, {useEffect, useState} from 'react';
import {Alert, Animated, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** App */
import Form from './Form';
import ListProducts from './ListProducts';
import FetchService from '../lib/FetchService';
import {initialListData, STORAGE_KEY, STORAGE_USER} from '../lib/constants';
import {formatListProducts, toUppercaseKeys} from '../lib/Helpers';

let value = 0;

const animatedValue = new Animated.Value(0);

const frontInterpolate = animatedValue.interpolate({
  inputRange: [0, 180],
  outputRange: ['0deg', '180deg'],
});
const backInterpolate = animatedValue.interpolate({
  inputRange: [0, 180],
  outputRange: ['180deg', '360deg'],
});

const FlipPage = (props) => {
  animatedValue.addListener((valueListener) => {
    value = valueListener.value;
  });
  const [isErrorApi, setIsErrorApi] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [productAdded, setProductAdded] = useState(null);
  const [listData, setListData] = useState({
    categories: initialListData,
    brands: initialListData,
    listProducts: {
      sold: [],
      haventsold: [],
    },
  });

  useEffect(() => {
    const initData = async () => {
      await getListCategoriesBrands();
      await getListProducts();
    }

    initData();
  }, []);

  useEffect(() => {
    if (productAdded !== null) {
      getListProducts();
    }
  }, [productAdded]);

  const getListProducts = async () => {
    try {
      const listProducts = await FetchService.get('products', props.token);
      const {listProductsSold, listProductsHaventSold} = formatListProducts(listProducts.data);
      isErrorApi && setIsErrorApi(false);
      setListData({
        ...listData,
        listProducts: {
          sold: listProductsSold,
          haventsold: listProductsHaventSold,
        },
      });
    } catch (error) {
      console.debug(error);
      setIsErrorApi(true);
    }
  };

  const getListCategoriesBrands = async () => {
    try {
      const categories = await FetchService.get('categories', props.token);
      const brands = await FetchService.get('brands', props.token);

      // token va expiré, envoyer une requete pour renouveler le token
      if (categories.refreshToken) {
        try {
          const user = AsyncStorage.getItem(STORAGE_USER);
          const userData = JSON.parse(user);
          const {username, password} = userData;
          const response = await FetchService.login(username, password);
          if (response && response.token) {
            await AsyncStorage.setItem(STORAGE_KEY, response.token);
            setToken(token);
          }
        } catch (error) {
          console.debug(error);
        }
      }

      if (categories.data.length > 0 && brands.data.length > 0) {
        const listCategories = [];
        categories.data.forEach((category) => {
          const newCategory = toUppercaseKeys(category);
          newCategory['HasImage'] = true;
          listCategories.push(newCategory);
        });
        const listBrands = [];
        brands.data.forEach((brand) => {
          const newBrand = toUppercaseKeys(brand);
          listBrands.push(newBrand);
        });

        setListData({
          ...listData,
          categories: listCategories,
          brands: listBrands,
        });
      }
    } catch (error) {
      console.debug(error);
      if (error === 'Not allowed to use this Resource') {
        Alert.alert(
          'Erreur système',
          'Votre session à expirée, veuillez-vous re-connecter.',
          [{text: 'Se déconnecter', onPress: () => props.handleLogout()}],
        );
      } else {
        Alert.alert(
          'Erreur système',
          'SecondLife rencontre une erreur, veuillez réessayer plus tard.',
        );
      }
    }
  };

  const flipCard = () => {
    if (value >= 90) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setShowForm(true);
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setShowForm(false);
    }
  };

  const updateListProducts = (uri) => {
    const newProductsSold = [...listData.listProducts.sold];
    const newProductsHaventSold = [];
    listData.listProducts.haventsold.forEach((product) => {
      if (product.uri === uri) {
        newProductsSold.push({
          ...product,
          sold: true,
        });
      } else {
        newProductsHaventSold.push(product);
      }
    });
    setListData({
      ...listData,
      listProducts: {
        sold: newProductsSold,
        haventsold: newProductsHaventSold,
      },
    });
  };

  const frontAnimatedStyle = {
    transform: [{rotateY: frontInterpolate}],
  };
  const backAnimatedStyle = {
    transform: [{rotateY: backInterpolate}],
  };
  let displayFrontStyle = {display: 'flex'};
  let displayBackStyle = {display: 'none'};
  if (!showForm) {
    displayFrontStyle = {display: 'none'};
    displayBackStyle = {display: 'flex'};
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.flipCard, frontAnimatedStyle, displayFrontStyle]}>
        <Form
          categories={listData.categories}
          brands={listData.brands}
          handleLogout={props.handleLogout}
          flipCard={flipCard}
          handleAddProduct={(product) => setProductAdded(product)}
          token={props.token}
        />
      </Animated.View>
      <Animated.View
        style={[backAnimatedStyle, styles.flipCard, displayBackStyle]}>
        <ListProducts
          listProductsSold={listData.listProducts.sold}
          listProductsHaventSold={listData.listProducts.haventsold}
          updateListProducts={updateListProducts}
          isErrorApi={isErrorApi}
          flipCard={flipCard}
          token={props.token}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipCard: {
    height: '100%',
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  flipText: {
    width: 90,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlipPage;
