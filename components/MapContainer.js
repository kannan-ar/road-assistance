import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from "react-native";
import { MapView } from "expo";
import { Spinner, ActionSheet, Root } from "native-base";

import { getLocationAsync } from '../services/MapService';
import { getPlaceTypes, getPlaceType } from '../services/PlaceService';
import pinImg from '../assets/pin.png';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapContainer extends React.Component {
    state = {
        isLoading: false,
        location: {},
        place_type: ''
    };

    componentWillMount() {
        getLocationAsync(this.locStore.bind(this));
    }

    locStore(latitude, longitude) {
        this.setState({ isLoading: true, location: { latitude, longitude } });
    }

    onMapPress() {
        ActionSheet.show(
            {
                options: getPlaceTypes(),
                title: "Pick a service"
            },
            buttonIndex => {
                this.setState({ place_type: getPlaceType(buttonIndex) });
            }
        )
    }

    render() {
        if (!this.state.isLoading) {
            return (
                <View style={styles.map}>
                    <Spinner color='green' />
                </View>
            );
        }
        else {
            let location = this.state.location;
            return (
                <Root>
                    <View style={{ width, height }}>
                        <MapView onPress={this.onMapPress.bind(this)}
                            style={styles.map}
                            region={{
                                ...location,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            }}>
                            <MapView.Marker coordinate={{ ...location }} title="You are here">
                                <Image source={pinImg} />
                            </MapView.Marker>
                        </MapView>
                        {!!this.state.place_type && <Text>Hello</Text>}
                    </View>
                </Root>
            );
        }
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    }
});