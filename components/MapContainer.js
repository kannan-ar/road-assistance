import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text, Animated, Button, Easing } from "react-native";
import { MapView } from "expo";
import { Spinner, ActionSheet, Root } from "native-base";

import { getLocationAsync, getMarkerPlaces } from '../services/MapService';
import { getPlaceTypes, getPlaceType } from '../services/PlaceService';
import pinImg from '../assets/pin.png';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DISTANCE = 500;

export default class MapContainer extends React.Component {
    state = {
        isLoading: false,
        location: {},
        place_type: '',
        places: []
    };

    componentDidMount() {
        getLocationAsync(this.onLocationChange.bind(this));
    }

    componentWillMount() {
        this.animation = new Animated.Value(0);
    }

    onLocationChange(latitude, longitude) {
        this.setState({ isLoading: true, location: { latitude, longitude } });

        if (this.state.place_type !== '') {
            this.LoadPlaces(latitude, longitude, this.state.place_type);
        }

        this.animateMarker();
    }

    LoadPlaces(latitude, longitude, place) {
        getMarkerPlaces(latitude, longitude, DISTANCE, place).then((data) => this.setState({ places: data }));
    }

    getMarkerStyle() {
        const scaleStyle = {
            transform: [
                {
                    scale: this.animation.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [1, 2.5, 1],
                        extrapolate: "clamp"
                    })
                }
            ]
        };

        const opacityStyle = {
            opacity: this.animation.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [0.35, 1, 0.35],
                extrapolate: "clamp",
            }),
        };

        return { scaleStyle, opacityStyle };
    }

    onMapPress() {
        ActionSheet.show(
            {
                options: getPlaceTypes(),
                title: "Pick a service"
            },
            buttonIndex => {
                if (buttonIndex !== undefined) {
                    let placeType = getPlaceType(buttonIndex);
                    this.setState({ place_type: placeType });
                    this.LoadPlaces(this.state.location.latitude, this.state.location.longitude, placeType);
                }
            }
        )
    }

    animateMarker() {
        Animated.timing(this.animation, {
            toValue: 3,
            duration: 1500,
            easing: Easing.linear
        }).start(() => {
            this.animation.setValue(0);
        });
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
            let { scaleStyle, opacityStyle } = this.getMarkerStyle();
            return (
                <Root>
                    <View style={{ width, height }}>
                        <MapView onPress={this.onMapPress.bind(this)}
                            style={styles.container}
                            region={{
                                ...location,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            }}>
                            <MapView.Marker coordinate={{ ...location }} title="You are here">
                                <Animated.View style={[styles.markerWrap, opacityStyle]}>
                                    <Animated.View style={[styles.ring, scaleStyle]} />
                                    <View style={styles.pointer} />
                                </Animated.View>
                            </MapView.Marker>
                            {!!this.state.places && this.state.places
                                .map((item, index) => (<MapView.Marker key={index} coordinate={item.coord}>
                                    <View>
                                        <Text style={styles.text}>{item.rating}</Text>
                                    </View>
                                </MapView.Marker>))}
                        </MapView>
                    </View>
                </Root>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#550bbc',
        fontWeight: 'bold'
    },
    markerWrap: {
        alignItems: "center",
        justifyContent: "center"
    },
    pointer: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: "rgba(130,4,150, 0.9)",
        margin: 14
    },
    ring: {
        width: 14,
        height: 14,
        borderRadius: 8,
        backgroundColor: "rgba(130,4,150, 0.3)",
        position: "absolute",
        borderWidth: 1,
        borderColor: "rgba(130,4,150, 0.5)"
    }
});