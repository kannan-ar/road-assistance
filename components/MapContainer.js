import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text, Animated, Button, Easing } from "react-native";
import { MapView } from "expo";
import { Spinner, ActionSheet, Root } from "native-base";

import { getLocationAsync, getMarkerPlaces } from '../services/MapService';
import { getPlaceTypes, getPlaceType } from '../services/PlaceService';
import { getImageLink } from '../services/ImageService';

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
        this.animateRegion();
    }

    componentWillMount() {
        this.animation = new Animated.Value(0);
        this.placeAnimation = new Animated.Value(0);
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

    getInterpolation(index) {
        const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            ((index + 1) * CARD_WIDTH),
        ];
        const scale = this.placeAnimation.interpolate({
            inputRange,
            outputRange: [1, 2.5, 1],
            extrapolate: "clamp",
        });
        const opacity = this.placeAnimation.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: "clamp",
        });

        const scaleStyle = {
            transform: [
                {
                    scale: scale,
                },
            ],
        };
        const opacityStyle = {
            opacity: opacity,
        };

        return { scaleStyle, opacityStyle };
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

    animateRegion() {
        this.placeAnimation.addListener(({ value }) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3);
            if (index >= this.state.places.length) {
                index = this.state.places.length - 1;
            }
            if (index <= 0) {
                index = 0;
            }

            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
                if (this.index !== index) {
                    this.index = index;
                    let coord = this.state.places[index].coord;
                    this.map.animateToRegion(
                        {
                            latitude: coord.latitude,
                            longitude: coord.longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        },
                        350
                    );
                }
            }, 10);
        });
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

    renderPlaces() {
        if (this.state.places.length == 0) {
            return null;
        }
        /*
        this.state.places.map((item, index) => {
            console.log(item.name);
            console.log(interpolations[index].scaleStyle);
        });
*/
        return this.state.places.map((item, index) => {
            let interpolation = this.getInterpolation(index);
            return (<MapView.Marker key={index} coordinate={item.coord}>
                <Animated.View style={[styles.placeWrap, interpolation.opacityStyle]}>
                    <Animated.View style={[styles.placeRing, interpolation.scaleStyle]} />
                    <View style={styles.placePointer} />
                </Animated.View>
            </MapView.Marker>)
        }
        )
    }

    renderPlaceCarousel() {
        if (this.state.places.length == 0) {
            return null;
        }

        return (
            <Animated.ScrollView horizontal scrollEventThrottle={1} showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH}
                style={styles.scrollView} contentContainerStyle={styles.endPadding} onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: {
                                    x: this.placeAnimation,
                                },
                            },
                        },
                    ],
                    { useNativeDriver: true }
                )}>
                {!!this.state.places && this.state.places.map((item, index) => (
                    <View style={styles.card} key={index}>
                        {item.photo_reference != '' ?
                            <Image source={{ uri: getImageLink(CARD_WIDTH.toFixed(0), item.photo_reference) }} style={styles.cardImage} resizeMode="cover" /> : null
                        }
                        <View style={styles.textContent}>
                            <Text numberOfLines={1} style={styles.cardtitle}>{item.name} {item.rating == null ? null : (item.rating)}</Text>
                        </View>
                    </View>
                ))}
            </Animated.ScrollView>)
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
                        <MapView ref={map => this.map = map} onPress={this.onMapPress.bind(this)}
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
                            {this.renderPlaces()}
                        </MapView>
                        {this.renderPlaceCarousel()}
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
    pointer: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: "rgba(130,4,150, 0.9)",
        margin: 14
    },
    placeWrap: {
        alignItems: "center",
        justifyContent: "center"
    },
    placeRing: {
        width: 14,
        height: 14,
        borderRadius: 8,
        backgroundColor: "#72a0ea",
        position: "absolute",
        borderWidth: 1,
        borderColor: "#568ce2"
    },
    placePointer: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: "#3674d8",
        margin: 14
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
        flexDirection: 'row'
    },
    cardtitle: {
        flex: 1,
        flexWrap: 'wrap',
        fontSize: 11,
        marginTop: 5,
    },
    cardDescription: {
        fontSize: 12,
        color: "#444",
    }
});