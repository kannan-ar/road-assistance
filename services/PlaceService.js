
export const getPlaces = async (latitude, longitude, radius, query) => {
    let response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${query}&key=AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48`);
    let json = await response.json();
    return json;
}

export const formatPlaces = (json) => {

}