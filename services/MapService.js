import { Location, Permissions } from "expo";

import { getPlaces } from './PlaceService';

export const getLocationAsync = async (locStore) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
        let location = await Location.watchPositionAsync({ enableHighAccuracy: true, distanceInterval: 10 }, (loc) => {
            let { latitude, longitude } = loc.coords;
            locStore(latitude, longitude);
        });
    }
};

export const drawPlaces = (distance, keyword) => {
    getPlaces(latitude, longitude, distance, keyword).then((data) => {
        console.log(JSON.stringify(data));
    });
}