import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addNickname } from '../reducers/user';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [nickname, setNickname] = useState('');
  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }

  const handlePress = () => {
    // Fonction qui gère le clic sur le bouton 'Go to map'
    if (nickname === '' || nickname.length < 3) {
      // Si le nickname est vide ou a moins de 3 caractères on affiche une alerte
      alert('Please enter a nickname 🤬 with at least 3 characters');
      return;
    }
    navigation.navigate('TabNavigator'); // Sinon on navigue vers le TabNavigator
    dispatch(addNickname(nickname)); // On dispatch l'action addNickname avec le nickname en paramètre pour le stocker dans le store
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image
        style={styles.image}
        source={require('../assets/home-image.png')}
      />
      <Text style={styles.title}>Welcome to Locate Me</Text>
      <TextInput
        style={styles.input}
        placeholder="Nickname"
        onChangeText={(value) => setNickname(value)}
        value={nickname}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePress()}
        activeOpacity={0.8}
      >
        <Text style={styles.textButton}>Go to map</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 35,
    fontWeight: 600,
    fontFamily: 'Pacifico_400Regular',
  },
  image: {
    width: '100%',
    height: '60%',
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#B733D0',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    width: '80%',
    backgroundColor: '#B733D0',
    borderRadius: 12,
  },
  textButton: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});