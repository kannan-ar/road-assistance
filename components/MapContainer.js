import React from 'react';
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import { MapView, Location, Permissions, Animated } from "expo";
import pinImg from '../assets/pin.svg';

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
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
            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            this.setState({ isLoading: true, location: location });
        }
    };

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
                <MapView
                    style={{ flex: 1 }}
                    region={{
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    }}>
                    <MapView.Marker coordinate={{ latitude: lat, longitude: lng }} title="You are here" />
                </MapView>
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
    }
});