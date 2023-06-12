import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPlace, removePlace, updatePlace } from '../reducers/user';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const BACKEND_ADDRESS = 'https://locale-me-backend-ul27.vercel.app';

export default function PlacesScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [newCity, setNewCity] = useState('');

  const handlePress = () => {
    // Fonction qui gère l'ajout d'un lieu en base de données et dans le store Redux
    if (newCity.length === 0) {
      // Si le champ est vide, on ne fait rien et on sort de la fonction
      return;
    }

    fetch(`https://api-adresse.data.gouv.fr/search/?q=${newCity}`) // On récupère les coordonnées du lieu à ajouter grâce à l'API data.gouv.fr
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length === 0) {
          // Si la réponse est vide, on ne fait rien et on sort de la fonction
          return;
        }

        const firstCity = data.features[0];
        const newPlace = {
          // On crée un objet newPlace avec les données du lieu à ajouter
          name: firstCity.properties.name,
          latitude: firstCity.geometry.coordinates[1],
          longitude: firstCity.geometry.coordinates[0],
        };

        fetch(`${BACKEND_ADDRESS}/places`, {
          // On envoie les données du lieu à ajouter en base de données (nickname, nom du lieu, latitude et longitude) au format JSON
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: user.nickname,
            name: newPlace.name,
            latitude: newPlace.latitude,
            longitude: newPlace.longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            // On récupère la réponse du serveur et si elle est positive, on dispatch l'action addPlace avec le lieu à ajouter en paramètre pour le stocker dans le store Redux
            if (data.result) {
              dispatch(addPlace(newPlace));
              setNewCity('');
            }
          });
      });
  };

  const handleDelete = (value) => {
    // Fonction qui gère la suppression d'un lieu en base de données et dans le store Redux
    fetch(`${BACKEND_ADDRESS}/places`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: user.nickname, name: value }), // On envoie le nom du lieu à supprimer en base de données (nickname et nom du lieu) au format JSON
    })
      .then((response) => response.json())
      .then((data) => {
        data.result && dispatch(removePlace(value)); // On dispatch l'action removePlace avec le nom du lieu à supprimer en paramètre pour le supprimer du store Redux
      });
  };

  const places = user.places.map((place, id) => {
    // On boucle sur le tableau des lieux stockés dans le store Redux pour les afficher dans une liste
    return (
      <View key={id} style={styles.placeCard}>
        <View>
          <Text style={styles.name}>{place.name}</Text>
          <Text>
            LAT : {place.latitude} LON : {place.longitude}
          </Text>
        </View>
        <FontAwesome
          name="trash-o"
          style={styles.icon}
          onPress={() => handleDelete(place.name)}
        />
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{user.nickname}'s Places</Text>

      <View style={styles.inputBlock}>
        <TextInput
          placeholder="New city"
          style={styles.input}
          onChangeText={(value) => setNewCity(value)}
          value={newCity}
        />
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => handlePress()}
        >
          <Text style={styles.textButton}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {places}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginTop: 30,
    marginBottom: 20,
    fontFamily: 'Pacifico_400Regular',
  },
  name: {
    fontSize: 18,
  },
  inputBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '80%',
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
  },
  input: {
    width: '65%',
    borderBottomWidth: 1,
    borderBottomColor: '#B733D0',
    fontSize: 17,
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#B733D0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 7,
  },
  textButton: {
    color: '#fff',
  },
  scrollView: {
    alignItems: 'center',
    marginTop: 20,
    maxWidth: '100%',
  },
  placeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  icon: {
    color: '#B733D0',
    fontSize: 23,
  },
});