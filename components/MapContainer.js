import React from 'react';
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { MapView, Location, Font } from "expo";
import { Spinner, Container, Header, Button, Icon, Content, Left } from "native-base";

import { getLocationAsync } from '../services/MapService';
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
       // Location.setApiKey('AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48');
       getLocationAsync(1000, 'restaurant', this.locStore.bind(this));
    }

    locStore(latitude, longitude) {
        this.setState({ isLoading: true, location: { latitude, longitude } });
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
                <Container>
                    <Header>
                        <Left>
                            <Button transparent>
                                <Icon name="menu" />
                            </Button>
                        </Left>
                    </Header>
                    <Content>
                        <View style={{ width, height }}>
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
                            </MapView>
                        </View>
                    </Content>
                </Container>
            );
        }
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    }
});