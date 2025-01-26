import { useEffect, useState } from "react";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../api.js";
import Places from "./Places.jsx";

const AvailablePlaces = ({ onSelectPlace }) => {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  /** Using fetch
  useEffect(() => {
  fetch('http://localhost:3000/places')
  .then(response =>{ return response.json()})
  .then(resData => setAvailablePlaces(resData.places) );
}, []);
*/
  /** Using async/await */
  useEffect(() => {
    const fetchPlaces = async () => {
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces(); //fetch with async will return promise
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });
      } catch (error) {
        setError({
          message: error.message || "Could not fetch places. Please try later",
        });
        setIsFetching(false);
      }

        /** have to move this one since we introduced sorting and callback function
      setIsFetching(false);
      */
      
    };

    //remember to call this function
    fetchPlaces();
  }, []);

  if (error) {
    return <Error title="En error occured!" message={error.message} />;
  }

  return (
    <Places
      title="Available Places"
      isLoading={isFetching}
      loadingText="Loading places..."
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
};
export default AvailablePlaces;
