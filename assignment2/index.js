import { mapData, filterByOriginAirport, filterByDestinationAirport,  filterByAirline, filterByAircraft, mapDirectDistanceBetweenAirports } from './functions.js';

// Filters and search
const sourceAirportFilter = document.querySelector("#filterSourceAirportSelect");
const destinationAirportFilter = document.querySelector("#filterDestinationAirportSelect");
const airlineFilter = document.querySelector("#filterAirlineSelect");
const aircraftFilter = document.querySelector('#filterAircraftSelect');
const cityFilter = document.querySelector("#filterCitySelect");
const airportSearch = document.querySelector("#filterSearchTermInput");

// Display divs
const flightsDisplayDiv = document.querySelector("#flightFilterDisplayDiv");
const airportsDisplayDiv = document.querySelector("#airportFilterDisplayDiv")

let flightsData = [];
let airportsData = [];

function displayFlights(dataset) {
    // Clear flights div content
    flightsDisplayDiv.innerHTML = '';

    if (!dataset || dataset.length === 0) {
        flightsDisplayDiv.innerHTML = "There are no flights that match this query, please try again.";
    } else { 
        let listElement = document.createElement('ol');
        flightsDisplayDiv.appendChild(listElement);
        dataset.forEach(el => {
            listElement.innerHTML += `<li class='list-item'>
                                        <span class='fw-bold'>Source Airport:</span> ${el['source_airport']['name'] || 'Not Specified'} (${el['source_airport']['id'] || 'Not Specified'}) | 
                                        <span class='fw-bold'>Destination Airport:</span> ${el['destination_airport']['name'] || 'Not Specified'} (${el['destination_airport']['id'] || 'Not Specified'}) |
                                        <span class='fw-bold'>Airline:</span> ${el['airline']['name'] || 'Not Specified'} |
                                        <span class='fw-bold'>Aircraft/s:</span> ${el['aircraft'].join(', ') || 'Not Specified'} |
                                        <span class='fw-bold'>Distance:</span> ${el['direct_distance'] ? el['direct_distance'].toFixed(2) + 'km' : 'Not Specified'} 
                                    </li>`
        })
    }
}

function displayAirports(dataset) {
    // Clear airports div content
    airportsDisplayDiv.innerHTML = '';

    if (!dataset || dataset.length === 0) {
        airportsDisplayDiv.innerHTML = "There are no airports that match this query, please try again.";
    } else { 
        let listElement = document.createElement('ol');
        airportsDisplayDiv.appendChild(listElement);
        dataset.forEach(el => {
            listElement.innerHTML += `<li class='list-item'>
                                        <span class='fw-bold'>ID:</span> ${el['id'] || 'Not Specified'} | 
                                        <span class='fw-bold'>Name:</span> ${el['name'] || 'Not Specified'} |
                                        <span class='fw-bold'>City:</span> ${el['city'] || 'Not Specified'} |
                                        <span class='fw-bold'>IATA:</span> ${el['iata'] || 'Not Specified'} |
                                        <span class='fw-bold'>Latitude:</span> ${el['latitude'] || 'Not Specified'} |
                                        <span class='fw-bold'>Longitude:</span> ${el['longitude'] || 'Not Specified'} |
                                        <span class='fw-bold'>Altitude:</span> ${el['altitude'] || 'Not Specified'} |
                                        <span class='fw-bold'>Timezone:</span> ${el['timezone'] || 'Not Specified'} 
                                    </li>`
        })
    }
}



function appendOptionsToDropdown(dropdown, callback, dataset) {
    const mappedData = dataset.map(callback); 
    let result = [];
    mappedData.forEach((el) => {
        if (Array.isArray(el)) {
            el.forEach(e => {
                if (!result.includes(e) && e) result.push(e);
            })
        } else {
            if (!result.includes(el) && el) result.push(el);
        }
    })

    result.sort().forEach((el, i) => {
        let opt = document.createElement("option");
        opt.value = el;
        opt.text = el;
        dropdown.add(opt, null);
    })
}

function filterFlights() {
    const sourceAirportValue = sourceAirportFilter.value;
    const destinationAirportValue = destinationAirportFilter.value;
    const airlineValue = airlineFilter.value;
    const aircraftValue = aircraftFilter.value;

    let cloneData = [];
    flightsData.forEach(flight => cloneData.push(flight));

    if (sourceAirportValue !== "any")  {
        cloneData = filterByOriginAirport(cloneData, sourceAirportValue) || [];
    } 
    
    if (destinationAirportValue !== "any") {
        cloneData = filterByDestinationAirport(cloneData, destinationAirportValue) || [];
    }

    if (airlineValue !== 'any') {
        cloneData = filterByAirline(cloneData, airlineValue) || [];
    }

    if (aircraftValue !== 'any') { 
        cloneData = filterByAircraft(cloneData, aircraftValue) || [];
    }

    return cloneData;
}

function filterAirports() {
    const cityValue = cityFilter.value;
    const searchQuery = airportSearch.value;
    
    let cloneData = [];
    airportsData.forEach(flight => cloneData.push(flight));

    if (cityValue !== "any")  {
        cloneData = cloneData.filter(el => el['city'] === cityValue);
    } 

    if (searchQuery) {
        cloneData = cloneData.filter(el => {
            for (const key in el) {
                if (el[key] === searchQuery) {
                    return true;
                }
            }

            return false;
        })
    }

    return cloneData;
}

async function setFlightsData() {
    try {
        const res = await fetch('./Combined_Data.json');
        let data = await res.json();
        flightsData = mapData(data, mapDirectDistanceBetweenAirports).data;
        console.log(flightsData.length);
        appendOptionsToDropdown(sourceAirportFilter, (el) => el['source_airport'] ? el['source_airport']['name'] : '', flightsData);
        appendOptionsToDropdown(destinationAirportFilter, (el) => el['destination_airport'] ? el['destination_airport']['name'] : '', flightsData);
        appendOptionsToDropdown(airlineFilter, (el) => el['airline'] ? el['airline']['name'] : '', flightsData);
        appendOptionsToDropdown(aircraftFilter, (el) => el['aircraft'] ? el['aircraft'] : [], flightsData);
    } catch (error) {
        console.log(error);
    }
}

async function setAirportsData() {
    try {
        const res = await fetch('./A2_Airports.json');
        let data = await res.json();
        airportsData = mapData(data, mapDirectDistanceBetweenAirports)['data'];
        appendOptionsToDropdown(cityFilter, (el) => el['city'] ? el['city'] : '', airportsData);
    } catch (error) {
        console.log(error);
    }
}

setFlightsData();
setAirportsData();


sourceAirportFilter.addEventListener('change', (event) => {
    displayFlights(filterFlights());
})

destinationAirportFilter.addEventListener('change', (event) => {
    displayFlights(filterFlights());
}) 

airlineFilter.addEventListener('change', (event) => {
    displayFlights(filterFlights());
}) 

aircraftFilter.addEventListener('change', (event) => {
    displayFlights(filterFlights());
}) 

cityFilter.addEventListener('change', (event) => {
    displayAirports(filterAirports());
})

airportSearch.addEventListener('input', (event) => {
    displayAirports(filterAirports());
})








