import { Location, Permissions } from "expo";

import { getPlaces, formatPlaces } from './PlaceService';

export const getLocationAsync = async (onLocationChange) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
        let location = await Location.watchPositionAsync({ enableHighAccuracy: true, distanceInterval: 100 }, (loc) => {
            let { latitude, longitude } = loc.coords;
            onLocationChange(latitude, longitude);
        });
    }
};

export const getMarkerPlaces = async (latitude, longitude, distance, keyword) => {
    return formatPlaces(await getPlaces(latitude, longitude, distance, keyword));
}