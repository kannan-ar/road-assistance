import {GOOGLE_API_KEY} from '../Environment';

export const getImageLink = (width, photo_reference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photoreference=${photo_reference}&key=${GOOGLE_API_KEY}`;
}