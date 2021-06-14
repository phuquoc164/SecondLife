/** React */
import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

/** App */
import ResultPage from './ResultPage';
// import CustomDateTimePicker from '../components/CustomDateTimePicker';
import PickerCategories from "../components/PickerCategories";
import Picker from '../components/Picker';
import ModalPhoto from '../components/ModalPhoto';
import ModalScanner from '../components/ModalScanner';
import AutocompleteInput from '../components/AutocompleteInput';
import {initialArticle, initialInformation, listStates} from '../lib/constants';
import { validateEmail } from '../lib/Helpers';
import FetchService from '../lib/FetchService';
import {colors} from '../lib/colors';

const zIndexLastName = Platform.OS === "ios" ? { zIndex: 10 } : {};
const zIndexFirstName = Platform.OS === "ios" ? { zIndex: 9 } : {};
const zIndexEmail = Platform.OS === "ios" ? { zIndex: 8 } : {};

const Form = props => {
	const [loading, setLoading] = useState(false);
	const [isLoadingScreen, setIsLoadingScreen] = useState(false);
	const [hideSize, setHideSize] = useState(false);
	const [categories, _setCategories] = useState({
		options: [],
		ids: {}
	});
	const categoriesRef = useRef(categories);
	const [ranks, setRanks] = useState({
		options: [],
		selected: null
	});
	const [priceConseil, setPriceConseil] = useState({
		title: "Calcul de l'argus impossible",
		price: null,
		voucherAmount: null,
		buyPrice: null,
		tooltipPrice: {
			show: false,
			text:
				"Pour calculer le prix conseillé de votre article, merci de renseigner les informations suivantes: Catégorie, Marque et État. Notre argus est un prix conseillé et est utilisé à titre indicatif."
		},
		tooltipVoucher: {
			show: false,
			text:
				"Pour calculer le prix conseillé de votre article, merci de renseigner les informations suivantes: Catégorie, Marque et État. Notre argus est un prix conseillé et est utilisé à titre indicatif."
		}
	});
	const [isModification, setIsModification] = useState(false);
	const [information, setInformation] = useState(initialInformation);
	const [article, setArticle] = useState(initialArticle);
	const [showScanner, setShowScanner] = useState(false);
	const [showCalendar, setShowCalendar] = useState(false);
	const [showModalPhoto, setShowModalPhoto] = useState(false);
	const [keyboardDisplay, setKeyboardDisplay] = useState("never");
	const [resultPage, setResultPage] = useState({
		show: false,
		isSuccess: false,
		text: ""
	});
	const [showError, setShowError] = useState(false);
	const { customers, listLastNames, listFirstNames, listEmails } = props.listCustomers;
	const listLastNamesFiltered = useRef(listLastNames);
	const listFirstNamesFiltered = useRef(listFirstNames);
	const listEmailsFiltered = useRef(listEmails);

	const setCategories = (categories) => {
		categoriesRef.current = categories;
		_setCategories(categories);
	}
	useEffect(() => {
		if (props.productModified && Object.keys(props.productModified).length > 0) {
			const { customer, product } = props.productModified;
			setInformation({ ...information, ...customer });
			setArticle({
				...article,
				...product,
				pictures: product.pictures.map(picture => picture.content),
				brand: {
					Id: "product_modifiable",
					Name: product.brand
				},
				state: {
					Id: product.state,
					Name: product.state
				},
				price: `${product.price} €`,
				voucherAmount: `${product.voucherAmount} €`
			});
			setHideSize(product.category.includes("Accessoires") || product.category.includes("Sacs"));
			setIsModification(true);
		}
	}, [props.productModified]);

	useEffect(() => {
		const { listLastNames, listFirstNames, listEmails } = props.listCustomers;
		listLastNamesFiltered.current = listLastNames;
		listFirstNamesFiltered.current = listFirstNames;
		listEmailsFiltered.current = listEmails;
	}, [props.listCustomers]);

	const handleTakePhoto = async () => {
		setShowModalPhoto(false);
		const options = {
			mediaType: "photo",
			maxWidth: 1000,
			maxHeight: 1000,
			includeBase64: true,
			quality: 0.9
		};
		const permissionCamera = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
		try {
			const granted = await request(permissionCamera);
			if (granted === RESULTS.GRANTED) {
				launchCamera(options, response => {
					if (response.didCancel) {
						console.debug("User cancelled image picker");
					} else if (response.error || response.errorCode) {
						console.debug("ImagePicker Error: ", response.error ? response.error : response.errorCode);
					} else if (response.customButton) {
						console.debug("User tapped custom button: ", response.customButton);
					} else {
						setArticle({
							...article,
							pictures: [...article.pictures, response.base64]
						});
					}
				});
			} else {
				console.debug("Camera permission denied");
				Alert.alert("Demande de permission", "Nous avons besoin de la permission d'accéder à votre caméra.", [
					{ text: "Annuler", style: "cancel" },
					{ text: "Paramètres", onPress: () => Linking.openSettings() }
				]);
			}
		} catch (err) {
			console.warn(err);
		}
	};

	const handleSelectPhoto = async () => {
		setShowModalPhoto(false);
		const options = {
			mediaType: "photo",
			maxWidth: 1000,
			maxHeight: 1000,
			includeBase64: true
		};
		let permissionPhoto = Platform.OS === "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

		try {
			const granted = await request(permissionPhoto);
			if (granted === RESULTS.GRANTED) {
				launchImageLibrary(options, response => {
					if (response.didCancel) {
						console.debug("User cancelled image picker");
					} else if (response.error) {
						console.debug("ImagePicker Error: ", response.error);
					} else if (response.customButton) {
						console.debug("User tapped custom button: ", response.customButton);
					} else {
						setArticle({
							...article,
							pictures: [...article.pictures, response.base64]
						});
					}
				});
			} else {
				console.debug("Photo permission denied");
				Alert.alert("Demande de permission", "Nous avons besoin de la permission d'accéder à votre bibliothèque média.", [
					{ text: "Annuler", style: "cancel" },
					{ text: "Paramètres", onPress: () => Linking.openSettings() }
				]);
			}
		} catch (error) {
			console.warn(err);
		}
	};

	const handleDeletePhoto = index => {
		const newPictures = [...article.pictures];
		newPictures.splice(index, 1);
		setArticle({
			...article,
			pictures: newPictures
		});
	};

	const handleAddArticle = () => {
		setLoading(true);
		const isErrorInformation = true;
		const isErrorArticle = true;

		if (isErrorInformation || isErrorArticle) {
			Alert.alert("Formulaire invalide", "Veuillez corriger les champs encadrés en rouge.");
			setShowError(true);
			setLoading(false);
		} else {
			const data = '';
			FetchService.post("products", data, props.token)
				.then(response => {
					if (response.success) {
						setResultPage({
							show: true,
							isSuccess: true,
							text: "Votre article a été\najouté avec succès !"
						});
						props.handleAddProduct(data);
					} else {
						setResultPage({
							show: true,
							isSuccess: false,
							text: "Votre article n'a pas pu\nêtre ajouté"
						});
					}
				})
				.catch(error => {
					console.debug(error);
					setResultPage({
						show: true,
						isSuccess: false,
						text: "Votre article n'a pas pu\nêtre ajouté"
					});
				});
		}
	};

	const handleAddOtherArticle = () => {
		if (resultPage.isSuccess) {
			setInformation(initialInformation);
			setArticle(initialArticle);
			showError && setShowError(false);
		} else {
			!showError && setShowError(true);
		}
		loading && setLoading(false);
		setResultPage({ show: false, isSuccess: false, test: "" });
	};

	const verifyTextInput = (type, property) => {
		if (type === "information") {
			return information[property] && information[property] !== "";
		} else if (type === "article") {
			return article[property] && article[property] !== "";
		}
	};

	const handleScanSuccess = event => {
		setShowScanner(false);
		const data = JSON.parse(event.data);
		if (data.type && data.type === "product") {
			setArticle({ ...article, reference: `${data.reference}` });
		} else {
			Alert.alert("Problème de scanner", "On ne peut pas récupérer la référence. Veuillez réessayer!");
		}
	};

	const handleAutocomplete = () => {
		const { firstName, lastName, email } = information;
		if (firstName !== "" && lastName !== "" && email !== "") {
			const key = `${firstName} ${lastName} - ${email}`;
			if (customers[key]) {
				const { address, city, phone, zipCode } = customers[key];
				setInformation({
					...information,
					address,
					city,
					phone: phone,
					zipCode: zipCode
				});
			}
		}
	};

	const handleCancelModification = () => {
		setIsModification(false);
		setInformation(initialInformation);
		setArticle(initialArticle);
		props.handleCancelModification();
	};

	const handleSaveModification = () => {
		setLoading(true);
		const isErrorInformation = true;
		const isErrorArticle = true;

		if (isErrorInformation || isErrorArticle) {
			Alert.alert("Formulaire invalide", "Veuillez corriger les champs encadrés en rouge.");
			setShowError(true);
			setLoading(false);
		} else {
			const data = '';

			FetchService.patch(props.productModified.uri, data, props.token)
				.then(response => {
					if (response.success) {
						const productModified = {
							customer: { ...information },
							product: {
								...article,
								voucherAmount: parseFloat(article.voucherAmount.replace(" €", "")),
								price: parseFloat(article.price.replace(" €", "")),
								category: article.category.Id.replace("/{manufacturer}/", `/${article.brand.Name}/`),
								brand: article.brand.Name,
								state: article.state.Name,
								pictures: article.pictures.map((photo, index) => ({
									name: `image${index + 1}`,
									content: photo
								}))
							},
							sku: article.reference,
							uri: props.productModified.uri
						};
						props.handleSaveModification(productModified);
					} else {
						setResultPage({
							show: true,
							isSuccess: false,
							text: "Votre article n'a pas pu\nêtre enregistré"
						});
					}
				})
				.catch(error => {
					console.debug(error);
					setResultPage({
						show: true,
						isSuccess: false,
						text: "Votre article n'a pas pu\nêtre enregistré"
					});
				});
		}
	};

	const handleSelectBrand = (selected) => {
		setIsLoadingScreen(true);
		FetchService.get("categories?brand=" + selected.Id, props.token).then(result => {
			if (result.data.length > 0) {
				const listCategories = [];
				const listCategoryIds = {};

				result.data.forEach(category => {
					const newCategory = {
						Id: category.name,
						Name: category.name,
						HasImage: true,
						children: category.children
					};
					listCategories.push(newCategory);
					let categoryName = category.name;
					category.children.forEach(child => {
						categoryName += "/" + child.name;
						if (child.children) {
							child.children.forEach(c => {
								listCategoryIds[categoryName + "/" + c.name] = c.id;
							});
						} else {
							listCategoryIds[categoryName] = child.id;
						}
						categoryName = category.name;
					});
				});
				setCategories({
					options: listCategories,
					ids: listCategoryIds
				});
				setRanks({
					options: [],
					selected: null
				});
				setArticle({ ...article, category: null, brand: selected });
				setIsLoadingScreen(false);
			}
		}).catch(error => {
			console.error(error);
			setIsLoadingScreen(false);
			Alert.alert("Erreur système", "On ne peut pas récupérer la liste des catégories. Veuillez-vous réessayer!");
		})
	}

	const handleUpdateArgusData = (selected, type, currentRanks = []) => {
		let endPoint = "argus?name=" + (article.name ? article.name : "") + "&";
		if (type === "category") {
			setHideSize(selected.includes("Accessoires") || selected.includes("Sacs"));
		}
		if (type === "rank") {
			setRanks({ ...ranks, selected: selected });
		} else {
			setArticle({ ...article, [type]: selected });
		}
		let title = "Veuillez sélectionner ";
		let tooltipTitle = "Pour calculer le prix conseillé de votre article, merci de renseigner les informations suivantes: ";

		tableArgus.forEach(typeArgus => {
			if (typeArgus.type === type) {
				endPoint += buildEndpoint(type, selected);
			} else {
				if (typeArgus.type === "rank") {
					if ((type === "category" && currentRanks.length > 0) || ranks.options.length > 0) {
						if (type !== "category" && ranks.selected && ranks.selected !== "") {
							endPoint += buildEndpoint(typeArgus.type, ranks.selected);
						} else if (type === "category" && currentRanks.length > 0) {
							title += "une " + typeArgus.title.toLowerCase() + ", ";
							tooltipTitle += typeArgus.title + ", ";
						}
					}
				} else {
					if (article[typeArgus.type] === "" || !article[typeArgus.type]) {
						title += "une " + typeArgus.title.toLowerCase() + ", ";
						tooltipTitle += typeArgus.title + ", ";
					} else {
						endPoint += buildEndpoint(typeArgus.type, article[typeArgus.type]);
					}
				}
			}
		});

		if (title === "Veuillez sélectionner ") {
			endPoint = endPoint.slice(0, -1);
			setIsLoadingScreen(true);
			FetchService.get(endPoint, props.token)
				.then(result => {
					if (result.data.price && result.data.voucher && result.data.price !== 0 && result.data.voucher !== 0) {
						setPriceConseil({
							title: "Prix conseillé: ",
							price: result.data.price,
							voucherAmount: result.data.voucher,
							buyPrice: result.data.buyPrice === 0 ? null : result.data.buyPrice,
							tooltipPrice: {
								show: false,
								text: "Nos prix conseillés sont basés sur l'état du produit, sa marque, ainsi que sa catégorie. Il ne vous engage en rien."
							},
							tooltipVoucher: {
								show: false,
								text:
									"Nos prix conseillés concernant la reprise bon d'achat sont basés sur l'état du produit, sa marque, ainsi que sa catégorie. Il ne vous engage en rien."
							}
						});
					} else {
						setPriceConseil({
							title: "Pas d'argus disponible",
							price: null,
							voucherAmount: null,
							buyPrice: null,
							tooltipPrice: {
								show: false,
								text:
									"Pour calculer le prix conseillé de votre article, merci de renseigner les informations suivantes: Catégorie, Marque et État. Notre argus est un prix conseillé et est utilisé à titre indicatif."
							},
							tooltipVoucher: {
								show: false,
								text:
									"Pour calculer le prix conseillé de votre article, merci de renseigner les informations suivantes: Catégorie, Marque et État. Notre argus est un prix conseillé et est utilisé à titre indicatif."
							}
						});
					}
					setIsLoadingScreen(false);
				})
				.catch(error => {
					console.error(error);
				});
		} else {
			title = title.slice(0, -2);
			tooltipTitle = tooltipTitle.slice(0, -2) + ". Notre argus est un prix conseillé et est utilisé à titre indicatif.";

			setPriceConseil({
				title,
				price: null,
				voucherAmount: null,
				buyPrice: null,
				tooltipPrice: {
					show: false,
					text: tooltipTitle
				},
				tooltipVoucher: {
					show: false,
					text: tooltipTitle
				}
			});
		}
	};

	const buildEndpoint = (type, value) => {
		if (type === "category") {
			return "category=" + categories.ids[value] + "&";
		} else if (type === "brand") {
			return "brand=" + value.Id + "&";
		} else if (type === "state") {
			return "state=" + value.Id + "&";
		} else if (type === "rank") {
			return "rank=" + value.Name + "&";
		}
	};

	const handleClickArgus = type => {
		if (!priceConseil[type]) return;
		setArticle({ ...article, [type]: `${priceConseil[type]} €` });
	};

	const renderFormArticle = () => (
		<SafeAreaView style={{ flexDirection: "column", position: "relative" }}>
			<KeyboardAwareScrollView keyboardShouldPersistTaps={keyboardDisplay}>
				<View style={{ padding: 20 }}>
					<Text style={styles.title}>Informations Client</Text>
					<View style={{ zIndex: 100 }}>
						<View style={styles.group}>
							{/* Nom */}
							<AutocompleteInput
								containerStyle={{ ...styles.inputGroup, ...zIndexLastName }}
								labelStyle={styles.label}
								autoCapitalize="characters"
								label="Nom"
								inputStyle={{
									...styles.input,
									borderColor: !showError || verifyTextInput("information", "lastName") ? colors.gray : colors.red
								}}
								onFocus={() => setKeyboardDisplay("always")}
								onBlur={() => setKeyboardDisplay("never")}
								placeholder="Nom client"
								value={information.lastName}
								onChangeText={lastName => {
									listLastNamesFiltered.current = listLastNames;
									setInformation({ ...information, lastName });
								}}
								options={listLastNamesFiltered.current}
							/>

							{/* Prénom */}
							<AutocompleteInput
								containerStyle={{ ...styles.inputGroup, ...zIndexFirstName }}
								labelStyle={styles.label}
								autoCapitalize="words"
								label="Prénom"
								inputStyle={{
									...styles.input,
									borderColor: !showError || verifyTextInput("information", "firstName") ? colors.gray : colors.red
								}}
								onFocus={() => setKeyboardDisplay("always")}
								onBlur={() => setKeyboardDisplay("never")}
								placeholder="Prénom client"
								value={information.firstName}
								onChangeText={firstName => {
									listFirstNamesFiltered.current = listFirstNames;
									setInformation({ ...information, firstName });
								}}
								options={listFirstNamesFiltered.current}
							/>

							{/* birthdayDate */}
							<View>
								<Text style={styles.label}>Date de naissance</Text>
								<TouchableOpacity
									style={{
										...styles.input,
										borderColor: !showError || verifyTextInput("information", "birthdayDate") ? colors.gray : colors.red
									}}
									onPress={() => setShowCalendar(true)}>
									<Text style={{ color }}>{textBirthday}</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={{ ...styles.group, zIndex: -1 }}>
							{/* Email */}
							<AutocompleteInput
								containerStyle={{ ...styles.inputGroup, ...zIndexEmail }}
								labelStyle={styles.label}
								label="E-mail"
								inputStyle={{
									...styles.input,
									borderColor: !showError || (information.email && validateEmail(information.email)) ? colors.gray : colors.red
								}}
								onFocus={() => setKeyboardDisplay("always")}
								onBlur={() => setKeyboardDisplay("never")}
								placeholder="E-mail client"
								value={information.email}
								autoCapitalize="none"
								keyboardType="email-address"
								onChangeText={email => {
									listEmailsFiltered.current = listEmails;
									setInformation({ ...information, email });
								}}
								options={listEmailsFiltered.current}
								handleAutocomplete={handleAutocomplete}
							/>

							{/* phone */}
							<View style={{ width: "100%" }}>
								<Text style={styles.label}>Télephone</Text>
								<TextInput
									style={{
										...styles.input,
										borderColor: !showError || verifyTextInput("information", "phone") ? colors.gray : colors.red
									}}
									autoCompleteType="tel"
									placeholder="ex: 06 00 00 00 00"
									placeholderTextColor={colors.gray}
									value={information.phone}
									keyboardType="phone-pad"
									onChangeText={phone => setInformation({ ...information, phone })}
								/>
							</View>
						</View>
					</View>

					<View style={styles.group}>
						{/* Adresse */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Adresse</Text>
							<TextInput
								style={{
									...styles.input,
									borderColor: !showError || verifyTextInput("information", "address") ? colors.gray : colors.red
								}}
								autoCapitalize="words"
								autoCompleteType="street-address"
								placeholder="Adresse client"
								placeholderTextColor={colors.gray}
								value={information.address}
								onChangeText={address => setInformation({ ...information, address })}
							/>
						</View>

						{/* Code postal + Ville */}
						<View
							style={{
								...styles.inputGroupInline,
								justifyContent: "space-between"
							}}>
							{/* Code postal */}
							<View style={{ flex: 2, marginRight: 20 }}>
								<Text style={styles.label}>Code postale</Text>
								<TextInput
									style={{
										...styles.input,
										borderColor: !showError || verifyTextInput("information", "zipCode") ? colors.gray : colors.red
									}}
									autoCompleteType="postal-code"
									placeholder="ex : 75002"
									placeholderTextColor={colors.gray}
									value={information.zipCode}
									keyboardType="number-pad"
									onChangeText={zipCode => {
										if (zipCode.length <= 5) {
											setInformation({ ...information, zipCode });
										}
									}}
								/>
							</View>

							{/* Ville */}
							<View style={{ flex: 3 }}>
								<Text style={styles.label}>Ville</Text>
								<TextInput
									style={{
										...styles.input,
										borderColor: !showError || verifyTextInput("information", "city") ? colors.gray : colors.red
									}}
									placeholder="ex : Paris"
									placeholderTextColor={colors.gray}
									value={information.city}
									onChangeText={city => setInformation({ ...information, city })}
								/>
							</View>
						</View>
					</View>

					{/* ============================================= */}
					<Text style={styles.title}>Ajouter un article</Text>
					<View style={styles.group}>
						<Text style={styles.label}>Ajoute jusqu'à 5 photos</Text>
						<View
							style={{
								...styles.photoView,
								borderColor: !showError || article.pictures.length > 0 ? colors.gray : colors.red
							}}>
							{article.pictures.map((photo, index) => (
								<View key={index} style={{ width: "33.3%", aspectRatio: 1, padding: 5, position: "relative" }}>
									<TouchableOpacity
										onPress={() => handleDeletePhoto(index)}
										style={{
											position: "absolute",
											top: -2,
											right: -2,
											zIndex: 2,
											backgroundColor: colors.white,
											borderRadius: 50,
											padding: 4
										}}>
										<Image source={require("../assets/images/cross-black.png")} style={{ width: 10.5, height: 10 }} />
									</TouchableOpacity>

									<Image
										source={{
											uri: "data:image/png;base64," + photo
										}}
										style={styles.image}
									/>
								</View>
							))}
							{article.pictures.length === 0 && (
								<View style={{ width: "100%", alignItems: "center" }}>
									<TouchableOpacity style={styles.btnAddPhotoText} onPress={() => setShowModalPhoto(true)}>
										<Image source={require("../assets/images/addPhoto.png")} style={{ width: 242, height: 76.5 }} />
									</TouchableOpacity>
								</View>
							)}
							{article.pictures.length > 0 && article.pictures.length < 5 && (
								<View
									style={{
										width: "33.3%",
										aspectRatio: 1,
										padding: 20,
										justifyContent: "center",
										alignItems: "center"
									}}>
									<TouchableOpacity onPress={() => setShowModalPhoto(true)}>
										<Image source={require("../assets/images/plus.png")} style={{ width: 57, height: 57 }} />
									</TouchableOpacity>
								</View>
							)}
						</View>
					</View>

					<View style={styles.group}>
						{/* Réference */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Référence</Text>
							<View style={{ flexDirection: "row" }}>
								<TextInput
									style={{
										...styles.input,
										flex: 1,
										borderColor: !showError || verifyTextInput("article", "reference") ? colors.gray : colors.red
									}}
									placeholder="ex : 5341ezf845"
									placeholderTextColor={colors.gray}
									value={article.reference}
									onChangeText={reference => setArticle({ ...article, reference })}
								/>
								<TouchableOpacity
									style={{
										marginLeft: 15
									}}
									onPress={() => setShowScanner(true)}>
									<Image
										source={require("../assets/images/qr_code.png")}
										style={{
											width: 30,
											height: 30,
											resizeMode: "contain",
											alignSelf: "center"
										}}
									/>
								</TouchableOpacity>
							</View>
						</View>
						{/* Name */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Nom</Text>
							<TextInput
								style={{
									...styles.input,
									borderColor: !showError || verifyTextInput("article", "name") ? colors.gray : colors.red
								}}
								placeholder="ex : Polo Ralph Lauren Rouge"
								placeholderTextColor={colors.gray}
								value={article.name}
								onChangeText={name => setArticle({ ...article, name })}
							/>
						</View>

						{/* Description */}
						<View style={{ width: "100%" }}>
							<Text style={styles.label}>Description</Text>
							<TextInput
								style={styles.inputMultiLine}
								placeholder="Décrivez l'article"
								placeholderTextColor={colors.gray}
								value={article.description}
								multiline={true}
								numberOfLines={5}
								onChangeText={description => setArticle({ ...article, description })}
							/>
						</View>
					</View>

					<View style={styles.group}>
						{/* Brands */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Marque</Text>
							<Picker
								dataSelected={article.brand}
								items={props.brands}
								placeholder="Sélectionnez une marque"
								showError={showError}
								onSelected={selected => handleSelectBrand(selected)}
								autoGenerateAlphabeticalIndex={true}
								showAlphabeticalIndex={true}
								renderSearch={false}
							/>
						</View>

						{/* Catégorie */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Catégorie</Text>
							<PickerCategories
								brand={article.brand}
								dataSelected={article.category}
								items={categoriesRef.current.options}
								showError={showError}
								onSelected={(selected, ranks) => {
									setRanks({
										options: ranks.map(rank => ({ Id: rank, Name: rank })),
										selected: null
									});
									handleUpdateArgusData(selected, "category", ranks);
								}}
							/>
						</View>

						{ranks.options.length > 0 && (
							<View style={{ width: "100%", marginBottom: 10 }}>
								<Text style={styles.label}>Grade</Text>
								<Picker
									dataSelected={ranks.selected}
									items={ranks.options}
									placeholder="Indiquez la grade"
									showError={showError}
									onSelected={selected => handleUpdateArgusData(selected, "rank")}
									autoGenerateAlphabeticalIndex={false}
									showAlphabeticalIndex={false}
									renderSearch={true}
									titleSearch="Grade"
								/>
							</View>
						)}

						{/* Size */}
						{!hideSize && (
							<View style={styles.inputGroup}>
								<Text style={styles.label}>Taille</Text>
								<TextInput
									style={{
										...styles.input,
										borderColor: !showError || verifyTextInput("article", "size") ? colors.gray : colors.red
									}}
									name="size"
									placeholder="Indiquez la taille de l'article"
									placeholderTextColor={colors.gray}
									value={article.size}
									onChangeText={size => setArticle({ ...article, size })}
								/>
							</View>
						)}

						{/* State */}
						<View style={{ width: "100%", marginBottom: 10 }}>
							<Text style={styles.label}>Etat</Text>
							<Picker
								dataSelected={article.state}
								items={listStates}
								placeholder="Indiquez l'état de l'article"
								showError={showError}
								onSelected={selected => handleUpdateArgusData(selected, "state")}
								autoGenerateAlphabeticalIndex={false}
								showAlphabeticalIndex={false}
								renderSearch={true}
								titleSearch="état"
							/>
						</View>
					</View>

					<View style={styles.group}>
						{/* voucher */}
						<ArgusComponent
							labelStyle={styles.label}
							inputStyle={{
								...styles.input,
								borderColor: !showError || verifyTextInput("article", "voucherAmount") ? colors.gray : colors.red
							}}
							name="voucherAmount"
							value={article.voucherAmount}
							argusTitle={priceConseil.title}
							argusPrice={priceConseil.voucherAmount}
							tooltip={priceConseil.tooltipVoucher}
							onUpdateData={(value, name) => setArticle({ ...article, [name]: value })}
							handleClickArgus={type => handleClickArgus(type)}
							toggleTooltip={show =>
								setPriceConseil({
									...priceConseil,
									tooltipVoucher: { ...priceConseil.tooltipVoucher, show }
								})
							}
						/>

						{/* Price */}
						<ArgusComponent
							labelStyle={styles.label}
							inputStyle={{
								...styles.input,
								borderColor: !showError || verifyTextInput("article", "price") ? colors.gray : colors.red
							}}
							name="price"
							value={article.price}
							argusTitle={priceConseil.title}
							argusPrice={priceConseil.price}
							tooltip={priceConseil.tooltipPrice}
							onUpdateData={(value, name) => setArticle({ ...article, [name]: value })}
							handleClickArgus={type => handleClickArgus(type)}
							toggleTooltip={show =>
								setPriceConseil({
									...priceConseil,
									tooltipPrice: { ...priceConseil.tooltipPrice, show }
								})
							}
						/>
					</View>

					{priceConseil.buyPrice && (
						<View
							style={{
								...styles.group,
								flexDirection: "row"
							}}>
							<Text style={{ fontSize: 15 }}>
								<Image source={require("../assets/images/exclamation.png")} style={{ width: 20, height: 20 }} /> Si l'article n'est pas vendu,
								notre partenaire Once Again s'engage à le racheter au prix de {priceConseil.buyPrice} €
							</Text>
						</View>
					)}

					{/* Btn submit */}
					{isModification ? (
						<View style={{ flexDirection: "row", marginTop: 10, marginBottom: 20 }}>
							<TouchableOpacity onPress={handleCancelModification} style={[styles.btnSubmit, { flex: 1, marginRight: 5, borderRadius: 0 }]}>
								<Text style={styles.btnSubmitText}>Annuler</Text>
							</TouchableOpacity>
							{loading ? (
								<View
									style={[
										styles.btnSubmit,
										{
											flex: 1,
											marginLeft: 5,
											borderRadius: 0,
											justifyContent: "center"
										}
									]}>
									<ActivityIndicator color={colors.white} />
								</View>
							) : (
								<TouchableOpacity onPress={handleSaveModification} style={[styles.btnSubmit, { flex: 1, marginLeft: 5, borderRadius: 0 }]}>
									<Text style={styles.btnSubmitText}>Enregistrer</Text>
								</TouchableOpacity>
							)}
						</View>
					) : (
						<View
							style={{
								alignSelf: "center",
								marginTop: 10,
								marginBottom: 20,
								width: "60%"
							}}>
							{loading ? (
								<View style={styles.btnSubmit}>
									<ActivityIndicator color={colors.white} />
								</View>
							) : (
								<TouchableOpacity style={styles.btnSubmit} onPress={handleAddArticle}>
									<Text style={styles.btnSubmitText}>Ajouter</Text>
								</TouchableOpacity>
							)}
						</View>
					)}
				</View>
			</KeyboardAwareScrollView>
			{/* <CustomDateTimePicker
				visible={showCalendar}
				onCancel={() => setShowCalendar(false)}
				mode="date"
				onValidate={date => {
					if (date !== null) {
						setInformation({
							...information,
							birthdayDate: date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
						});
					}
					setShowCalendar(false);
				}}
			/> */}
			<ModalPhoto
				visible={showModalPhoto}
				onCancel={() => setShowModalPhoto(false)}
				handleTakePhoto={handleTakePhoto}
				handleSelectPhoto={handleSelectPhoto}
			/>
			<ModalScanner visible={showScanner} onCancel={() => setShowScanner(false)} handleScanSuccess={handleScanSuccess} />
			{loadingScreen(isLoadingScreen)}
		</SafeAreaView>
	);

	let color = colors.gray;
	let textBirthday = "ex : 15-08-2000";
	if (information.birthdayDate) {
		textBirthday = information.birthdayDate;
		color = colors.black;
	}

	return resultPage.show ? (
		<ResultPage
			isSuccess={resultPage.isSuccess}
			handleLogout={props.handleLogout}
			returnHomePage={props.returnHomePage}
			havebtnDeconnecte={true}
			title={resultPage.text}
			btnComponent={() => {
				let btnText = "+ Ajouter un autre article";
				let btnStyle = { paddingVertical: 15 };
				if (!resultPage.isSuccess) {
					btnText = "Réessayer";
					btnStyle = { paddingVertical: 10 };
				}
				return (
					<View style={{ alignSelf: "center", position: "absolute", bottom: 80 }}>
						<TouchableOpacity
							style={{
								...styles.btnSubmit,
								...btnStyle,
								marginBottom: 0,
								marginTop: 35
							}}
							onPress={handleAddOtherArticle}>
							<Text
								style={{
									...styles.btnSubmitText,
									fontSize: btnText === "Réessayer" ? 25 : 20
								}}>
								{btnText}
							</Text>
						</TouchableOpacity>
					</View>
				);
			}}
		/>
	) : (
		renderFormArticle()
	);
};

const styles = StyleSheet.create({
	title: {
		fontSize: 20,
		marginBottom: 15,
		fontWeight: "bold"
	},
	group: {
		borderWidth: 2,
		borderColor: colors.gray,
		paddingHorizontal: 30,
		paddingVertical: 10,
		marginBottom: 20,
		backgroundColor: colors.white
	},
	inputGroup: {
		width: "100%",
		marginBottom: 20
	},
	inputGroupInline: {
		flex: 1,
		flexDirection: "row"
	},
	label: {
		color: "#808B96",
		fontWeight: "500",
		marginBottom: 5,
		fontSize: 16,
		fontWeight: "bold"
	},
	input: {
		height: 30,
		paddingVertical: 5,
		paddingHorizontal: 0,
		borderBottomWidth: 1
	},
	inputMultiLine: {
		minHeight: 120,
		textAlignVertical: "top",
		paddingVertical: 5,
		paddingHorizontal: 0,
		borderBottomWidth: 1,
		borderColor: colors.gray
	},
	photoView: {
		flexDirection: "row",
		borderStyle: "dashed",
		borderRadius: 8,
		borderWidth: 1,
		marginBottom: 10,
		padding: 5,
		flexWrap: "wrap",
		alignItems: "center"
	},
	image: {
		width: "100%",
		height: "100%",
		resizeMode: "cover"
	},
	btnAddPhotoText: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		marginVertical: 40,
		marginHorizontal: 30
	},
	btnAddPhoto: {
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.green,
		height: "100%",
		width: "100%"
	},
	btnSubmit: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		backgroundColor: colors.black,
		borderWidth: 1,
		marginBottom: 50
	},
	btnSubmitText: {
		fontSize: 25,
		color: colors.white,
		textAlign: "center",
		fontWeight: "bold"
	}
});

export default Form;
