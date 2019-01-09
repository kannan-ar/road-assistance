
export const getPlaces = async (latitude, longitude, radius, query) => {
    let response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=name,opening_hours,rating&locationbias=circle:${radius}@${latitude},${longitude}&key=AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48`);
    let json = await response.json();
    return json;
}