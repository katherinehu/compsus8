/* global google */
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { FaLocationArrow, FaTimes } from 'react-icons/fa';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { useRef, useState } from 'react';

const center = { lat: 48.8584, lng: 2.2945 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Make sure you have your API key here
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [gasCost, setGasCost] = useState('');

  const originRef = useRef();
  const destinationRef = useRef();

  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);

    // Assuming a fixed gas price and fuel efficiency for simplicity
    const gasPricePerGallon = 3.50; // For example, $3.50 per gallon
    const fuelEfficiency = 25; // For example, 25 miles per gallon
    const distanceInMiles = parseFloat(results.routes[0].legs[0].distance.text.replace(',', '').replace(' mi', ''));
    const totalGasCost = (distanceInMiles / fuelEfficiency) * gasPricePerGallon;

    setGasCost(totalGasCost.toFixed(2));
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setGasCost('');
    originRef.current.value = '';
    destinationRef.current.value = '';
  }

  return (
      <Flex
          position="relative"
          flexDirection="column"
          alignItems="center"
          h="100vh"
          w="100vw"
      >
        <Box position="absolute" left={0} top={0} h="100%" w="100%">
          <GoogleMap
              center={center}
              zoom={15}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              options={{
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
              onLoad={map => setMap(map)}
          >
            {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        </Box>
        <Box
            p={4}
            borderRadius="lg"
            m={4}
            bgColor="white"
            shadow="base"
            minW="container.md"
            zIndex="1"
        >
          <HStack spacing={2} justifyContent="space-between">
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
            <Autocomplete>
              <Input
                  type="text"
                  placeholder="Destination"
                  ref={destinationRef}
              />
            </Autocomplete>
            <ButtonGroup>
              <Button colorScheme="pink" onClick={calculateRoute}>
                Calculate Route
              </Button>
              <IconButton
                  aria-label="Clear route"
                  icon={<FaTimes />}
                  onClick={clearRoute}
              />
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent="space-between">
            <Text>Distance: {distance} </Text>
            <Text>Duration: {duration} </Text>
            <Text>Gas Cost: ${gasCost} </Text>
            <IconButton
                aria-label="center back"
                icon={<FaLocationArrow />}
                isRound
                onClick={() => {
                  map.panTo(center);
                  map.setZoom(15);
                }}
            />
          </HStack>
        </Box>
      </Flex>
  );
}

export default App;
