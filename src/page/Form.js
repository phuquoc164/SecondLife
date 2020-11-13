/** React */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

/** App */
import ResultPage from './ResultPage';
import CustomDateTimePicker from '../components/CustomDateTimePicker';
import {colors} from '../assets/colors';
import {
  initialArticle,
  initialInformation,
  initialListData,
  listStates,
  STORAGE_KEY,
  STORAGE_USER,
} from '../lib/constants';
import {
  createSku,
  toUppercaseKeys,
  validateEmail,
  verifyData,
} from '../lib/Helpers';
import FetchService from '../lib/FetchService';
import Picker from '../components/Picker';
import ModalPhoto from '../components/ModalPhoto';

const Form = (props) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(props.token);
  const [information, setInformation] = useState(initialInformation);
  const [article, setArticle] = useState(initialArticle);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModalPhoto, setShowModalPhoto] = useState(false);
  const [resultPage, setResultPage] = useState({
    show: false,
    isSuccess: false,
  });
  const [showError, setShowError] = useState(false);
  const [listData, setListData] = useState({
    categories: initialListData,
    brands: initialListData,
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const categories = await FetchService.get('categories', token);
      const brands = await FetchService.get('brands', token);

      // token va expiré, envoyer une requete pour renouveler le token
      if (categories.refreshToken || brands.refreshToken) {
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

      /** Initialiser le list categories et list des marques */
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
      console.debug("Error", error);
      if (error === 'Not allowed to use this Resource') {
        Alert.alert(
          'Problème de connexion',
          'Votre compte est connecté par autre appareil. Veuillez réconnecter!',
          [{text: 'Se déconnecter', onPress: () => props.handleLogout()}],
        );
      }
    }
  };

  const handleTakePhoto = async () => {
    setShowModalPhoto(false);
    const options = {
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: true,
      quality: 0.9
    };
    const permissionCamera =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    try {
      const granted = await request(permissionCamera);
      if (granted === RESULTS.GRANTED) {
        launchCamera(options, (response) => {
          if (response.didCancel) {
            console.debug('User cancelled image picker');
          } else if (response.error || response.errorCode) {
            console.debug(
              'ImagePicker Error: ',
              response.error ? response.error : response.errorCode,
            );
          } else if (response.customButton) {
            console.debug('User tapped custom button: ', response.customButton);
          } else {
            setArticle({
              ...article,
              photos: [...article.photos, response.base64],
            });
          }
        });
      } else {
        console.debug('Camera permission denied');
        Alert.alert(
          'Problème de permission',
          'SecondLife a besoin de la permission de caméra',
          [
            {text: 'Annuler', style: 'cancel'},
            {text: 'Paramètres', onPress: () => Linking.openSettings()},
          ],
        );
      }
    } catch (err) {
      console.warn(err);
    }
    
  };

  const handleSelectPhoto = async () => {
    setShowModalPhoto(false);
    const options = {
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: true,
    };
    let permissionPhoto =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    try {
      const granted = await request(permissionPhoto);
      if (granted === RESULTS.GRANTED) {
        launchImageLibrary(options, (response) => {
          console.log(response);
          if (response.didCancel) {
            console.debug('User cancelled image picker');
          } else if (response.error) {
            console.debug('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.debug('User tapped custom button: ', response.customButton);
          } else {
            setArticle({
              ...article,
              photos: [...article.photos, response.base64],
            });
          }
        });
      } else {
        console.debug('Photo permission denied');
        Alert.alert(
          'Problème de permission',
          'SecondLife a besoin de la permission pour accéder la bibliothèque de photo',
          [
            {text: 'Annuler', style: 'cancel'},
            {text: 'Paramètres', onPress: () => Linking.openSettings()},
          ],
        );
      }
    } catch (error) {

    }
    if (Platform.OS === "ios") {
      const granted = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      console.log(granted);
    }
    
  };

  const handleAddArticle = () => {
    setLoading(true);
    const isErrorInformation = verifyData(information);
    const isErrorArticle = verifyData(article);

    if (isErrorInformation || isErrorArticle) {
      Alert.alert(
        'Formulaire invalide',
        'Veuillez vérifier tous les champs rouges',
      );
      setShowError(true);
      setLoading(false);
    } else {
      const sku = createSku();
      const data = {
        firstName: information.firstName,
        lastName: information.lastName,
        birthdayDate: information.birthday,
        address: information.address,
        zipCode: information.postalCode,
        city: information.city,
        phone: information.telephone,
        email: information.email,
        products: [
          {
            name: article.name,
            sku: article.brand.Name + '-' + sku,
            description: article.description,
            price: parseFloat(article.price.replace(' €', '')),
            category: article.category.Id.replace(
              '/{manufacturer}/',
              `/${article.brand.Name}/`,
            ),
            reference: article.brand.Name + '-' + sku,
            pictures: article.photos.map((photo, index) => ({
              name: `image${index + 1}`,
              content: photo,
            })),
            size: article.size,
            state: article.state.Name,
          },
        ],
      };
      FetchService.post('products', data, token)
        .then((response) => {
          setResultPage({show: true, isSuccess: response.success});
        })
        .catch((error) => {
          console.debug(error);
          setResultPage({show: true, isSuccess: false});
        });
    }
  };

  const handleAddOtherArticle = () => {
    if (resultPage.isSuccess) {
      setInformation(initialInformation);
      setArticle(initialArticle);
      setShowError(false);
    } else {
      !!showError || setShowError(true);
    }
    setLoading(false);
    setResultPage({show: false, isSuccess: false});
  };

  const verifyTextInput = (type, property) => {
    if (type === 'information') {
      return information[property] && information[property] !== '';
    } else if (type === 'article') {
      return article[property] && article[property] !== '';
    }
  };

  const renderFormArticle = () => (
    <SafeAreaView style={{flexDirection: 'column'}}>
      <ScrollView>
        <View style={{paddingHorizontal: 20}}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{
              flex: 1,
              width: '50%',
              resizeMode: 'contain',
              marginTop: -20,
              alignSelf: 'center',
            }}
          />
          <Text style={styles.title}>Informations Client</Text>
          <View style={styles.group}>
            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('information', 'lastName')
                      ? colors.gray
                      : colors.red,
                }}
                autoCompleteType="name"
                placeholder="Nom client"
                placeholderTextColor={colors.gray}
                value={information.lastName}
                onChangeText={(lastName) =>
                  setInformation({...information, lastName})
                }
              />
            </View>

            {/* Prénom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('information', 'firstName')
                      ? colors.gray
                      : colors.red,
                }}
                placeholder="Prénom client"
                placeholderTextColor={colors.gray}
                value={information.firstName}
                onChangeText={(firstName) =>
                  setInformation({...information, firstName})
                }
              />
            </View>

            {/* birthday */}
            <View>
              <Text style={styles.label}>Date de naissance</Text>
              <TouchableOpacity
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('information', 'birthday')
                      ? colors.gray
                      : colors.red,
                }}
                onPress={() => setShowCalendar(true)}>
                <Text style={{color}}>{textBirthday}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.group}>
            {/* Adresse */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('information', 'address')
                      ? colors.gray
                      : colors.red,
                }}
                autoCompleteType="street-address"
                placeholder="Adresse client"
                placeholderTextColor={colors.gray}
                value={information.address}
                onChangeText={(address) =>
                  setInformation({...information, address})
                }
              />
            </View>

            {/* Code postal + Ville */}
            <View
              style={{
                ...styles.inputGroupInline,
                justifyContent: 'space-between',
              }}>
              {/* Code postal */}
              <View style={{flex: 2, marginRight: 20}}>
                <Text style={styles.label}>Code postale</Text>
                <TextInput
                  style={{
                    ...styles.input,
                    borderColor:
                      !showError || verifyTextInput('information', 'postalCode')
                        ? colors.gray
                        : colors.red,
                  }}
                  autoCompleteType="postal-code"
                  placeholder="ex : 75002"
                  placeholderTextColor={colors.gray}
                  value={information.postalCode}
                  keyboardType="number-pad"
                  onChangeText={(postalCode) => {
                    if (postalCode.length <= 5) {
                      setInformation({...information, postalCode});
                    }
                  }}
                />
              </View>

              {/* Ville */}
              <View style={{flex: 3}}>
                <Text style={styles.label}>Ville</Text>
                <TextInput
                  style={{
                    ...styles.input,
                    borderColor:
                      !showError || verifyTextInput('information', 'city')
                        ? colors.gray
                        : colors.red,
                  }}
                  placeholder="ex : Paris"
                  placeholderTextColor={colors.gray}
                  value={information.city}
                  onChangeText={(city) =>
                    setInformation({...information, city})
                  }
                />
              </View>
            </View>
          </View>

          <View style={styles.group}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError ||
                    (information.email && validateEmail(information.email))
                      ? colors.gray
                      : colors.red,
                }}
                autoCompleteType="email"
                placeholder="E-mail client"
                placeholderTextColor={colors.gray}
                autoCapitalize="none"
                value={information.email}
                keyboardType="email-address"
                onChangeText={(email) =>
                  setInformation({...information, email})
                }
              />
            </View>

            {/* Telephone */}
            <View style={{width: '100%'}}>
              <Text style={styles.label}>Télephone</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('information', 'telephone')
                      ? colors.gray
                      : colors.red,
                }}
                autoCompleteType="tel"
                placeholder="ex: 06 00 00 00 00"
                placeholderTextColor={colors.gray}
                value={information.telephone}
                keyboardType="phone-pad"
                onChangeText={(telephone) =>
                  setInformation({...information, telephone})
                }
              />
            </View>
          </View>

          {/* ============================================= */}
          <Text style={styles.title}>Ajouter un article</Text>
          <View style={styles.group}>
            <Text style={styles.label}>Ajoute jusqu'à 5 photos</Text>
            <View
              style={{
                ...styles.photoView,
                borderColor:
                  !showError || article.photos.length > 0
                    ? colors.gray
                    : colors.red,
              }}>
              {article.photos.map((photo, index) => (
                <View
                  key={index}
                  style={{width: '33.3%', aspectRatio: 1, padding: 5}}>
                  <Image
                    source={{
                      uri: 'data:image/png;base64,' + photo,
                    }}
                    style={styles.image}
                  />
                </View>
              ))}
              {article.photos.length === 0 && (
                <View style={{width: '100%', alignItems: 'center'}}>
                  <TouchableOpacity
                    style={styles.btnAddPhotoText}
                    onPress={() => setShowModalPhoto(true)}>
                    <Image
                      source={require('../assets/images/addPhoto.png')}
                      style={{width: 242, height: 76.5}}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {article.photos.length > 0 && article.photos.length < 5 && (
                <View
                  style={{
                    width: '33.3%',
                    aspectRatio: 1,
                    padding: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity onPress={() => setShowModalPhoto(true)}>
                    <Image
                      source={require('../assets/images/plus.png')}
                      style={{width: 57, height: 57}}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.group}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('article', 'name')
                      ? colors.gray
                      : colors.red,
                }}
                placeholder="ex : Polo Ralph Lauren Rouge"
                placeholderTextColor={colors.gray}
                value={article.name}
                onChangeText={(name) => setArticle({...article, name})}
              />
            </View>

            {/* Description */}
            <View style={{width: '100%'}}>
              <Text style={styles.label}>Déscription</Text>
              <TextInput
                style={{
                  ...styles.inputMultiLine,
                  borderColor:
                    !showError || verifyTextInput('article', 'description')
                      ? colors.gray
                      : colors.red,
                }}
                placeholder="Décrivez l'article"
                placeholderTextColor={colors.gray}
                value={article.description}
                multiline={true}
                numberOfLines={5}
                onChangeText={(description) =>
                  setArticle({...article, description})
                }
              />
            </View>
          </View>

          <View style={styles.group}>
            {/* Catégorie */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <Picker
                dataSelected={article.category}
                items={listData.categories}
                placeholder="Sélectionnez une catégorie"
                showError={showError}
                onSelected={(selected) =>
                  setArticle({...article, category: selected})
                }
                autoGenerateAlphabeticalIndex={false}
                showAlphabeticalIndex={false}
                renderSearch={true}
                titleSearch="Catégorie"
              />
            </View>

            {/* Brands */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marque</Text>
              <Picker
                dataSelected={article.brand}
                items={listData.brands}
                placeholder="Sélectionnez une marque"
                showError={showError}
                onSelected={(selected) =>
                  setArticle({...article, brand: selected})
                }
                autoGenerateAlphabeticalIndex={true}
                showAlphabeticalIndex={true}
                renderSearch={false}
              />
            </View>

            {/* Size */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Taille</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('article', 'size')
                      ? colors.gray
                      : colors.red,
                }}
                name="size"
                placeholder="Indiquez la taille de l'article"
                placeholderTextColor={colors.gray}
                value={article.size}
                onChangeText={(size) => setArticle({...article, size})}
              />
            </View>

            {/* State */}
            <View style={{width: '100%', marginBottom: 10}}>
              <Text style={styles.label}>Etat</Text>
              <Picker
                dataSelected={article.state}
                items={listStates}
                placeholder="Indiquez l'état de l'article"
                showError={showError}
                onSelected={(selected) =>
                  setArticle({...article, state: selected})
                }
                autoGenerateAlphabeticalIndex={false}
                showAlphabeticalIndex={false}
                renderSearch={true}
                titleSearch="Etat"
              />
            </View>
          </View>

          <View style={styles.group}>
            {/* Price */}
            <View style={{width: '100%', marginBottom: 10}}>
              <Text style={styles.label}>Prix</Text>
              <TextInput
                style={{
                  ...styles.input,
                  borderColor:
                    !showError || verifyTextInput('article', 'price')
                      ? colors.gray
                      : colors.red,
                }}
                name="price"
                placeholder="0.00 €"
                placeholderTextColor={colors.gray}
                onFocus={() => {
                  if (article.price) {
                    setArticle({
                      ...article,
                      price: article.price.replace(' €', ''),
                    });
                  }
                }}
                value={article.price}
                onBlur={() =>
                  setArticle({
                    ...article,
                    price: (article.price + ' €').replace(',', '.'),
                  })
                }
                keyboardType="decimal-pad"
                onChangeText={(price) => {
                  setArticle({...article, price});
                }}
              />
            </View>
          </View>
          <View
            style={{alignSelf: 'flex-end', marginTop: 10, marginBottom: 20}}>
            {loading ? (
              <View style={styles.btnSubmit}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.btnSubmit}
                onPress={handleAddArticle}>
                <Text style={styles.btnSubmitText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <CustomDateTimePicker
        visible={showCalendar}
        onCancel={() => setShowCalendar(false)}
        mode="date"
        onValidate={(date) => {
          if (date !== null) {
            setInformation({
              ...information,
              birthday:
                date.getDate() +
                '-' +
                (date.getMonth() + 1) +
                '-' +
                date.getFullYear(),
            });
          }
          setShowCalendar(false);
        }}
      />
      <ModalPhoto
        visible={showModalPhoto}
        onCancel={() => setShowModalPhoto(false)}
        handleTakePhoto={handleTakePhoto}
        handleSelectPhoto={handleSelectPhoto}
      />
    </SafeAreaView>
  );

  let color = colors.gray;
  let textBirthday = 'ex : 15-08-2000';
  if (information.birthday) {
    textBirthday = information.birthday;
    color = colors.black;
  }

  return resultPage.show ? (
    <ResultPage
      handleAddOtherArticle={handleAddOtherArticle}
      isSuccess={resultPage.isSuccess}
      handleLogout={props.handleLogout}
    />
  ) : (
    renderFormArticle()
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  group: {
    borderWidth: 2,
    borderColor: colors.gray,
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroupInline: {
    flex: 1,
    flexDirection: 'row',
  },
  label: {
    color: colors.gray,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  inputMultiLine: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  photoView: {
    flexDirection: 'row',
    borderStyle: 'dashed',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  btnAddPhotoText: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginVertical: 40,
    marginHorizontal: 30,
  },
  btnAddPhoto: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
    height: '100%',
    width: '100%',
  },
  btnSubmit: {
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.black,
    borderRadius: 7,
    borderWidth: 1,
  },
  btnSubmitText: {
    fontSize: 25,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Form;
