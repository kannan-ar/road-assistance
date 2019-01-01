import React from 'react';
import { Text, View, StyleSheet, Dimensions, Button, Alert } from "react-native";
import { MapView, Location, Permissions } from "expo";
import {getDirections} from '../services/DirectionService';

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapContainer extends React.Component {
    state = {
        isLoading: false,
        coords: null,
        location: {}
    };

    componentWillMount() {
        Location.setApiKey('AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48');
        this.getLocationAsync();
    }

    getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            this.setState({ isLoading: true, location: location });
        }
    };

    onClick = async() => {
        let latLng = `${this.state.location.coords.latitude},${this.state.location.coords.longitude}` ;
        let coords = await getDirections(latLng, "Infopark, Kakkanad");
        this.setState({coords: coords});
        //Alert.alert(JSON.stringify(msg));
    }

    render() {
        if (!this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading...</Text>
                </View>
            );
        }
        else {
            let lat = this.state.location.coords.latitude;
            let lng = this.state.location.coords.longitude;
            return (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: lat,
                            longitude: lng,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        }}>
                        <MapView.Marker coordinate={{ latitude: lat, longitude: lng }} title="You are here" draggable onDragEnd={(e) => { }} />
                        {!!this.state.coords && 
                            <MapView.Polyline coordinates={this.state.coords} strokeWidth={2} strokeColor="red" />
                        }
                    </MapView>
                    <Button title="Click Me" onPress={this.onClick} />
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        flex: 1,                            // Take up the whole screen
        justifyContent: 'flex-end',         // Arrange button at the bottom
        alignItems: 'center',               // Center button horizontally
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    }
});