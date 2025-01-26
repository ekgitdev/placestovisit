import { useRef, useState, useEffect, useCallback } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { updateUserPlaces, fetchUserPlaces } from "./api.js";
import Error from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsFetching(true);
      try {
        const places = await fetchUserPlaces(); //fetch with async will return promise

        setUserPlaces(places);
      } catch (error) {
        setError({
          message:
            error.message || "Could not fetch user places. Please try later",
        });
      }
      setIsFetching(false);
    };

    //remember to call this function
    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    //2nd alternative, but then have to show loading spinner
    // await updateUserPlaces([selectedPlace, ...userPlaces]);

    //optimistic update - update state first
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
    try {
      //userplaces not immediately updated, therefore manually add selectedPlace
      //updateUserPlaces returns Promise
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      //rollback change when error
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || "Failed to update places...",
      });
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    //optimistic update - first update state and then send requeast
    setUserPlaces((prevPickedPlaces) =>
      //creates new array that satisfy condition: contains only alements
      //that we didnt click on/didnt press to delete
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    try {
      await updateUserPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error) {
      //rollback change when error
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || "Failed to delete place...",
      });
    }
    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {
          //even if modal not open it can try to retrieve message from errorUpdatingPlaces
          //therefore check on errorUpdatingPlaces
          errorUpdatingPlaces && (
            <Error
              title="En error occured!"
              message={errorUpdatingPlaces.message}
              onConfirm={handleError}
            />
          )
        }
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="Error occured!" message={error.message} />}
        {!error && (
          <Places
            isLoading={isFetching}
            isLoadingText="Loading user places..."
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
