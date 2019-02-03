import { GOOGLE_API_KEY } from '../Environment';

const Places = [
    { type: "hospital", name: "Hospital" },
    { type: "doctor", name: "Doctor" },
    { type: "restaurant", name: "Restaurant" },
    { type: "atm", name: "ATM" },
    { type: "bank", name: "Bank" },
    { type: "cafe", name: "Cafe" },
    { type: "bar", name: "Bar" },
    { type: "bus_station", name: "Bus Station" },
    { type: "book_store", name: "Book Store" },
    { type: "library", name: "Library" },
    { type: "liquor_store", name: "Liquor Store" },
    { type: "liquor_store", name: "Liquor Store" },
    { type: "parking", name: "Parking" },
    { type: "pharmacy", name: "Pharmacy" },
    { type: "school", name: "School" },
    { type: "shopping_mall", name: "Shopping Mall" }]

export const getPlaceTypes = () => {
    return Places.map(p => p.name);
}

export const getPlaceType = (index) => {
    return Places[index].type;
}

export const getPlaces = async (latitude, longitude, radius, query) => {
    let response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${query}&key=${GOOGLE_API_KEY}`);
    let json = await response.json();
    return json;
}

export const formatPlaces = (json) => {
    return json.results.map((item) => {
        return {
            coord: { latitude: item.geometry.location.lat, longitude: item.geometry.location.lng }, name: item.name,
            opening_hours: item.opening_hours, rating: item.rating, photo_reference: Array.isArray(item.photos) && item.photos.length >= 0 ? 
            item.photos[0].photo_reference : ""
        }
    });
}