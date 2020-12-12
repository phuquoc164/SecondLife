/** React */
import React, {useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** App */
import ForgotPassword from './ForgotPassword';
import {colors} from '../assets/colors';
import FetchService from '../lib/FetchService';

const LoginPage = (props) => {
  const [username, setUsername] = useState({
    value: '',
    error: false,
  });
  const [password, setPassword] = useState({
    value: '',
    error: false,
  });
  const [isLoading, setIsLoading] = useState(false)
  const [passwordForgotten, setPasswordForgotten] = useState(false);

  const handleSendData = () => {
    if (username.value === '' || password.value === '') {
      username.value === '' && setUsername({...username, error: true});
      password.value === '' && setPassword({...password, error: true});
      return;
    }
    setIsLoading(true);
    FetchService.login(username.value, password.value).then(response => {
      if (response && response.token) {
        props.handleLogin(response.token, {username: username.value, password: password.value});
      }
    }).catch(error => {
      console.debug(error);
      Alert.alert(
        'Problème de connexion',
        'Votre identifiant ou votre mot de passe est invalide.',
      );
    });
    setIsLoading(false);
  };

  const renderLoginForm = () => {
    return (
      <View style={styles.mainScreen}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            flex: 1,
            width: '60%',
            maxWidth: 300,
            resizeMode: 'contain',
            marginTop: 20,
            marginBottom: 40,
          }}
        />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <View style={{position: 'relative'}}>
            <TextInput
              style={styles.input}
              name="username"
              autoCorrect={false}
              autoCompleteType="username"
              autoCapitalize="none"
              value={username.value}
              onChangeText={(value) => {
                const error =
                  value !== '' && username.error ? false : username.error;
                setUsername({error, value});
              }}
            />
            {username.error && (
              <Image
                source={require('../assets/images/error.png')}
                style={styles.iconError}
              />
            )}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={{position: 'relative'}}>
            <TextInput
              style={styles.input}
              name="password"
              autoCompleteType="password"
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry={true}
              value={password.value}
              onChangeText={(value) => {
                const error =
                  value !== '' && password.error ? false : password.error;
                setPassword({error, value});
              }}
            />
            {password.error && (
              <Image
                source={require('../assets/images/error.png')}
                style={styles.iconError}
              />
            )}
          </View>
        </View>
        <View style={{flex: 1}}>
          {isLoading ? (
            <View style={styles.button}>
              <ActivityIndicator color={colors.white} />
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSendData}>
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
          )}
        </View>
        =
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={styles.buttonTransparent}
            onPress={() => setPasswordForgotten(true)}>
            <Text style={styles.textPasswordForgotten}>
              J'ai perdu mon mot de passe
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return passwordForgotten ? (
    <ForgotPassword handleSendLinkReset={() => setPasswordForgotten(false)} />
  ) : (
    renderLoginForm()
  );
};

const styles = StyleSheet.create({
  mainScreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40,
  },
  inputGroup: {
    flex: 1,
    width: '100%',
  },
  label: {
    textTransform: 'uppercase',
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    height: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: colors.gray,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.black,
    borderRadius: 5,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 25,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  iconError: {
    position: 'absolute',
    right: 3,
    bottom: 2.5,
    width: 25,
    height: 25,
  },
  textPasswordForgotten: {
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
});

export default LoginPage;
