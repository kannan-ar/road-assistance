import { Location, Permissions } from "expo";

import { getPlaces, formatPlaces } from './PlaceService';

export const getLocationAsync = async (locStore) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
        let location = await Location.watchPositionAsync({ enableHighAccuracy: true, distanceInterval: 10 }, (loc) => {
            let { latitude, longitude } = loc.coords;
            locStore(latitude, longitude);
        });
    }
};

export const getMarkerPlaces = async (latitude, longitude, distance, keyword) => {
    //formatPlaces(await getPlaces(latitude, longitude, distance, keyword));
    return [{coord: {latitude: 10.0058822, longitude: 76.3066627}}];
}