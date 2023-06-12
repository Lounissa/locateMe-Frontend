import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { addPlace, importPlaces } from '../reducers/user';

const BACKEND_ADDRESS = 'https://locale-me-backend-ul27.vercel.app'; // Adresse IP de votre serveur backend à remplacer par la vôtre

export default function MapScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [currentPosition, setCurrentPosition] = useState(null); // On stocke la position actuelle de l'utilisateur
  const [tempCoordinates, setTempCoordinates] = useState(null); // On stocke les coordonnées de la position où l'utilisateur a appuyé longuement
  const [isModalVisible, setIsModalVisible] = useState(false); // On stocke la visibilité du modal pour ajouter un lieu sur la carte
  const [newPlace, setNewPlace] = useState(''); // On stocke le nom du lieu à ajouter

  useEffect(() => {
    // On demande la permission d'accéder à la position de l'utilisateur
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
          setCurrentPosition(location.coords);
        });
      }
    })();

    fetch(`${BACKEND_ADDRESS}/places/${user.nickname}`) // On récupère les lieux de l'utilisateur stockés en base de données pour les afficher sur la carte
      .then((response) => response.json())
      .then((data) => {
        data.result && dispatch(importPlaces(data.places)); // Si result est true on dispatch l'action importPlaces avec les lieux en paramètre pour les stocker dans le store
      });
  }, []);

  const handleLongPress = (e) => {
    // Fonction qui gère le clic long sur la carte
    setTempCoordinates(e.nativeEvent.coordinate);
    setIsModalVisible(true);
  };

  const handleNewPlace = () => {
    // Fonction qui gère l'ajout d'un lieu sur la carte en base de données
    fetch(`${BACKEND_ADDRESS}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'Application/json' },
      body: JSON.stringify({
        // On envoie les données du lieu à ajouter en base de données (nickname, nom du lieu, latitude et longitude) au format JSON
        nickname: user.nickname,
        name: newPlace,
        latitude: tempCoordinates.latitude,
        longitude: tempCoordinates.longitude,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          // Si le lieu a bien été ajouté en base de données, on dispatch l'action addPlace avec les données du lieu en paramètre pour l'ajouter dans le store
          dispatch(
            addPlace({
              name: newPlace,
              latitude: tempCoordinates.latitude,
              longitude: tempCoordinates.longitude,
            })
          );
          setIsModalVisible(false);
          setNewPlace('');
        }
      });
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setNewPlace('');
  };

  const markers = user.places.map((data, id) => {
    return (
      <Marker
        key={id}
        coordinate={{ latitude: data.latitude, longitude: data.longitude }}
        title={data.name}
      />
    );
  });

  return (
    <View style={styles.container}>
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              placeholder="New place"
              onChangeText={(value) => setNewPlace(value)}
              value={newPlace}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => handleNewPlace()}
              activeOpacity={0.8}
              style={styles.button}
            >
              <Text style={styles.textButton}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleClose()}
              activeOpacity={0.8}
              style={styles.button}
            >
              <Text style={styles.textButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MapView
        style={styles.map}
        mapType="hybrid"
        onLongPress={(e) => handleLongPress(e)}
      >
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title="My position"
            pinColor="#fecb2d"
          />
        )}
        {markers}
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: 150,
    borderBottomColor: '#B733D0',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  button: {
    width: 150,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#B733D0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  textButton: {
    color: '#fff',
    fontSize: 20,
  },
});