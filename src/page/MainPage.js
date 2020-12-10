/** React */
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/** App */
import Form from './Form';
import CameraScan from './CameraScan';
import ListProducts from './ListProducts';
import {initialListData} from '../lib/constants';
import FetchService from '../lib/FetchService';
import {
  formatListCustomers,
  formatListProducts,
  toUppercaseKeys,
} from '../lib/Helpers';
import {colors} from '../assets/colors';

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

const frontAnimatedStyle = {
  transform: [{rotateY: frontInterpolate}],
};
const backAnimatedStyle = {
  transform: [{rotateY: backInterpolate}],
};

const MainPage = (props) => {
  animatedValue.addListener((valueListener) => {
    value = valueListener.value;
  });
  const [token, setToken] = useState(props.token);
  const [productAdded, setProductAdded] = useState(null);
  const [referenceScanned, setReferenceScanned] = useState(null);
  const [isErrorApi, setIsErrorApi] = useState(false);
  const [pageShowed, setPageShowed] = useState('addProduct');
  const [listProducts, setListProducts] = useState({
    sold: [],
    haventsold: [],
  });
  const [listData, setListData] = useState({
    categories: initialListData,
    brands: initialListData,
  });
  const [listCustomers, setListCustomers] = useState({
    customers: [],
    listLastNames: [],
    listFirstNames: [],
    listEmails: [],
  });

  useEffect(() => {
    const initData = async () => {
      // await getListProducts();
      // await getListCategoriesBrands();
      // await getListCustomers();
    };

    initData();
  }, []);

  /** get list products when we add one product (for getting the uri of new product) */
  useEffect(() => {
    if (productAdded !== null) {
      getListProducts();
    }
  }, [productAdded]);

  /** Get List products */
  const getListProducts = async () => {
    try {
      const listProducts = await FetchService.get('products', token);
      const {listProductsSold, listProductsHaventSold} = formatListProducts(
        listProducts.data,
      );
      isErrorApi && setIsErrorApi(false);
      setListProducts({
        sold: listProductsSold,
        haventsold: listProductsHaventSold,
      });
    } catch (error) {
      console.debug(error);
      setIsErrorApi(true);
    }
  };

  const getListCustomers = async () => {
    try {
      const listCustomers = await FetchService.get('customers', token);
      const {
        customers,
        listLastNames,
        listFirstNames,
        listEmails,
      } = formatListCustomers(listCustomers.data);
      setListCustomers({
        customers,
        listLastNames,
        listFirstNames,
        listEmails,
      });
    } catch (error) {
      console.debug(error);
    }
  };

  /** Get list categories and brand
   * if we detecte refresh token in header, we renew token
   */
  const getListCategoriesBrands = async () => {
    try {
      const categories = await FetchService.get('categories', token);
      const brands = await FetchService.get('brands', token);

      // token va expiré, envoyer une requete pour renouveler le token
      if (categories.refreshToken) {
        try {
          const user = AsyncStorage.getItem(STORAGE_USER);
          const userData = JSON.parse(user);
          const {username, password} = userData;
          const response = await FetchService.login(username, password);
          if (response && response.token) {
            await AsyncStorage.setItem(STORAGE_KEY, response.token);
            setToken(response.token);
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

  /** Update list products when we click the button vendu */
  const updateListProducts = (uri) => {
    const newProductsSold = [...listProducts.sold];
    const newProductsHaventSold = [];
    listProducts.haventsold.forEach((product) => {
      if (product.uri === uri) {
        newProductsSold.push({
          ...product,
          sold: true,
        });
      } else {
        newProductsHaventSold.push(product);
      }
    });
    setListProducts({
      sold: newProductsSold,
      haventsold: newProductsHaventSold,
    });
  };

  const renderPage = () => {
    switch (pageShowed) {
      case 'addProduct':
        return (
          <Form
            listCustomers={listCustomers}
            categories={listData.categories}
            brands={listData.brands}
            handleLogout={props.handleLogout}
            handleAddProduct={(product) => setProductAdded(product)}
            token={token}
          />
        );
      case 'scanProduct':
        return (
          <CameraScan
            original={pageShowed}
            handleGetReferenceScanned={(reference) => {
              setReferenceScanned(reference);
              setPageShowed("listProducts");
            }}
          />
        );
      case 'scanVoucher':
        return (
          <CameraScan
            original={pageShowed}
            token={token}
          />
        );
      case 'listProducts':
        return (
          <ListProducts
            listProductsSold={listProducts.sold}
            listProductsHaventSold={listProducts.haventsold}
            updateListProducts={updateListProducts}
            isErrorApi={isErrorApi}
            referenceScanned={referenceScanned}
            resetReferenceScanned={() => setReferenceScanned(null)}
            token={token}
          />
        );
      default:
        return;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View>{renderPage()}</Animated.View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarItem}>
          <Text>Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarItem}>
          <Text>Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarItem}>
          <Text>Catalogue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBarItem}>
          <Text>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flipCard: {
    height: '100%',
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  btn: {
    width: 300,
    paddingVertical: 20,
    backgroundColor: colors.black,
  },
  btnText: {
    fontSize: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.white,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 50,
    shadowRadius: 2,
    shadowOffset: {width: 10, height: 10},
    shadowOpacity: 1.0,
    shadowColor: colors.black,
    elevation: 10,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  bottomBarItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainPage;
