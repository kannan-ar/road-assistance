import React from 'react';
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import { MapView, Location, Permissions } from "expo";
import {Spinner} from "native-base";
import { getDirections } from '../services/DirectionService';
import pinImg from '../assets/pin.png';

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapContainer extends React.Component {
    state = {
        isLoading: false,
        location: {}
    };

    componentWillMount() {
        Location.setApiKey('AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48');
        this.getLocationAsync();
    }

    getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.watchPositionAsync({ enableHighAccuracy: true, distanceInterval: 10 }, (loc) => {
                let { latitude, longitude } = loc.coords;
                this.setState({ isLoading: true, location: { latitude, longitude } });
            });
        }
    };

    onClick = async () => {
        let latLng = `${this.state.location.latitude},${this.state.location.longitude}`;
        let coords = await getDirections(latLng, "Infopark, Kakkanad");
        this.setState({ coords: coords });
        //Alert.alert(JSON.stringify(msg));
    }

    render() {
        if (!this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <Spinner color='green' />
                </View>
            );
        }
        else {
            let location = this.state.location;
            return (
                <View style={styles.container}>
                    <MapView
                        style={styles.map}
                        region={{
                            ...location,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        }}>
                        <MapView.Marker coordinate={{ ...location }} title="You are here">
                            <Image source={pinImg} />
                        </MapView.Marker>
                        {!!this.state.coords &&
                            <MapView.Polyline coordinates={this.state.coords} strokeWidth={2} strokeColor="red" />
                        }
                    </MapView>
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
    map: {
        ...StyleSheet.absoluteFillObject,
    }
});