import Polyline from "@mapbox/polyline";

const directionUrl = "https://maps.googleapis.com/maps/api/directions/json?origin=";

export const getDirections = async (origin, destination) => {
    //let url = `${directionUrl}${origin}&destination=${destination}&key=${process.env.GOOGLE_API_KEY}`;
    let url = `${directionUrl}${origin}&destination=${destination}&key=AIzaSyC8KCgLAceI_r1dV39kg8GxUSlupwQkp48`;
    let response = await fetch(url);
    let json = await response.json();
    
    let points = Polyline.decode(json.routes[0].overview_polyline.points);
    let coords = points.map((point, index) => {
        return {
            latitude: point[0],
            longitude: point[1]
        }
    });

    return coords;
}