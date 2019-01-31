import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text, Animated, Button, Easing } from "react-native";
import { MapView } from "expo";
import { Spinner, ActionSheet, Root } from "native-base";

import { getLocationAsync, getMarkerPlaces } from '../services/MapService';
import { getPlaceTypes, getPlaceType } from '../services/PlaceService';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DISTANCE = 500;
const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

export default class MapContainer extends React.Component {
    state = {
        isLoading: false,
        location: {},
        place_type: '',
        places: []
    };

    componentDidMount() {
        getLocationAsync(this.onLocationChange.bind(this));
        //console.log(Config.GOOGLE_API_KEY);
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
                                    <Animated.View style={[styles.placeWrap]}>
                                        <View style={styles.placePointer} />
                                    </Animated.View>
                                </MapView.Marker>))}
                        </MapView>
                        <Animated.ScrollView horizontal scrollEventThrottle={1} showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH} 
                            style={styles.scrollView} contentContainerStyle={styles.endPadding}>
                            {!!this.state.places && this.state.places.map((item, index) => (
                                <View style={styles.card} key={index}>
                                    <View style={styles.textContent}>
                                        <Text numberOfLines={1} style={styles.cardtitle}>test</Text>
                                    </View>
                                </View>
                            ))}
                        </Animated.ScrollView>
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
    markerWrap: {
        alignItems: "center",
        justifyContent: "center"
    },
    ring: {
        width: 14,
        height: 14,
        borderRadius: 8,
        backgroundColor: "rgba(130,4,150, 0.3)",
        position: "absolute",
        borderWidth: 1,
        borderColor: "rgba(130,4,150, 0.5)"
    },
    placeWrap: {
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
    placeRing: {
        width: 10,
        height: 10,
        borderRadius: 6,
        position: "absolute",
        borderWidth: 1,
        borderColor: "#606493"
    },
    placePointer: {
        width: 14,
        height: 14,
        borderRadius: 8,
        backgroundColor: "#f4bcbc",
        borderColor: "#9cb3d1",
        borderWidth: 1
    },
    scrollView: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      paddingVertical: 10,
    },
    endPadding: {
      paddingRight: width - CARD_WIDTH,
    },
    card: {
      padding: 10,
      elevation: 2,
      backgroundColor: "#FFF",
      marginHorizontal: 10,
      shadowColor: "#000",
      shadowRadius: 5,
      shadowOpacity: 0.3,
      shadowOffset: { x: 2, y: -2 },
      height: CARD_HEIGHT,
      width: CARD_WIDTH,
      overflow: "hidden",
    },
    cardImage: {
      flex: 3,
      width: "100%",
      height: "100%",
      alignSelf: "center",
    },
    textContent: {
      flex: 1,
    },
    cardtitle: {
      fontSize: 12,
      marginTop: 5,
      fontWeight: "bold",
    },
    cardDescription: {
      fontSize: 12,
      color: "#444",
    }
});