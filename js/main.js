// main.js code
// Google Analytics: change UA-XXXXX-Y to be your site's ID.
// window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
// ga('create', 'UA-XXXXX-Y', 'auto'); ga('set', 'anonymizeIp', true); ga('set', 'transport', 'beacon'); ga('send', 'pageview');

window.addEventListener('DOMContentLoaded', async function () {
  // Get the total number of buildings
  const totalBuildings = 8; // Replace 'n' with the total number of buildings

  // Add event listeners to the building buttons
  for (let i = 1; i <= totalBuildings; i++) {
    const buildingBtn = document.getElementById(`building_${i}`);
    buildingBtn.addEventListener('click', function () {
      updateMap(i);
    });
  }
  let dataArray = await getData();
  // Extract the unique dates from the cleaned data
  const uniqueDates = extractUniqueDates(dataArray);

  // Populate the list of dates in the HTML
  populateDateList(uniqueDates);
  await reset(dataArray);
});

async function getData() {
  // Fetch dataArray from localStorage
  const savedData = localStorage.getItem('data');
  const fetchedDataArray = savedData ? JSON.parse(savedData) : null;

  if (fetchedDataArray) {
    return fetchedDataArray
  } else {
    const csvFile = 'data/data.csv'; // Replace 'data.csv' with the path to your CSV file
    // Call the loadCSV function to start loading and processing the CSV file
    let dataArray = await loadCSV(csvFile);
    dataArray = cleanCSV(dataArray, 'in');

    // The dataArray is available here
    // console.log(dataArray);
    // const filename = 'cleaned_data.csv';
    // dumpCSV(dataArray, filename);
    localStorage.setItem('data', JSON.stringify(dataArray));
    return dataArray
  }
}

// Function to update the map based on the clicked button
async function updateMap(buildingNumber) {
  // Generate the image filename based on the building number
  const imageFilename = `${buildingNumber}.png`;

  // Set the image source
  const mapImage = document.getElementById('map');
  mapImage.src = `img/${imageFilename}`;
  mapImage.alt = `Map for Building ${buildingNumber}`;

  let selectedBuilding = getBuildingName(buildingNumber);

  let dataArray = await getData();
  updateDashboard(dataArray, null, selectedBuilding);
}

function getBuildingName(buildingNumber) {
  let selectedBuilding = null;
  switch (buildingNumber) {
    case 1:
      selectedBuilding = "Learning Commons"
      break;
    case 2:
      selectedBuilding = "Benson Center"
      break;
    case 3:
      selectedBuilding = "Swig"
      break;
    case 4:
      selectedBuilding = "Facilities"
      break;
    case 5:
      selectedBuilding = "Vari Hall and Lucas Hall"
      break;
    case 6:
      selectedBuilding = "Malley"
      break;
    case 7:
      selectedBuilding = "Graham"
      break;
    case 8:
      selectedBuilding = "University Villas"
      break;
    default:
      selectedBuilding = null
  }
  return selectedBuilding;
}

// Function to load and process the CSV file
async function loadCSV(csvFile) {
  try {
    const response = await fetch(csvFile);
    const csvData = await response.text();
    const dataArray = parseCSV(csvData); // You need to implement the 'parseCSV' function to parse the CSV data
    return dataArray;
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

// Function to parse the CSV data into an array
function parseCSV(csvData) {
  // Implement the logic to parse the CSV data into an array
  // You can use libraries like Papa Parse (https://www.papaparse.com/) for more advanced CSV parsing options
  // Here's a basic example of parsing CSV with simple comma separation
  const lines = csvData.split('\n');
  const dataArray = lines.map(line => line.split(','));
  return dataArray;
}

function cleanCSV(dataArray, splitString, includeHeader = false) {
  // Extract the header row from the original data
  let headerRow = dataArray[0];

  // Find the index of the 'Stream' column in the header row
  const streamColumnIndex = headerRow.indexOf('Stream');

  // Add the new column names after the 'Stream' column
  headerRow.splice(streamColumnIndex + 1, 0, 'Acceptable Stream', 'Received Stream');
  headerRow = headerRow.slice(0, -1);

  const cleanedData = dataArray.slice(1).map(row => {
    const cleanedRow = row.slice(0, -1).map(column => {
      // Remove leading/trailing whitespace and unnecessary characters from each column
      const cleanedColumn = column !== undefined ? column.replace(/"/g, '').trim() : '';
      return cleanedColumn;
    });

    // Convert the date to a standardized format (MM/DD/YYYY)
    const date = formatDate(cleanedRow[0]);

    // Parse numeric values and remove any non-numeric characters
    const volume = parseFloat(cleanedRow[4].replace(/[^0-9.-]+/g, ''));
    const weight = cleanedRow[5] !== undefined ? parseFloat(cleanedRow[5].replace(/[^0-9.-]+/g, '')) : '';

    // Split the Stream column into Received Stream and Acceptable Stream
    let receivedStream = '';
    let acceptableStream = '';

    const words = cleanedRow[2].trim().split(' ');

    if (words.length === 1) {
      receivedStream = cleanedRow[2].trim();
      acceptableStream = cleanedRow[2].trim();
    } else if (words.length === 3) {
      if (words[1] === splitString) {
        receivedStream = words[0].trim();
        acceptableStream = words[2].trim();
      }
    } else if (words.length === 4) {
      if (words[1] === splitString) {
        receivedStream = words[0].trim();
        acceptableStream = words.slice(2).join(' ').trim();
      } else if (words[2] === splitString) {
        receivedStream = words.slice(0, 2).join(' ').trim();
        if (receivedStream == 'Food Waste') {
          receivedStream = 'Compost';
        }
        acceptableStream = words[3].trim();
      }
    }

    // Return the cleaned row as an array
    return [date, cleanedRow[1], cleanedRow[2], receivedStream, acceptableStream, cleanedRow[3], volume, weight];
  });

  if (includeHeader) {
    // Add the header row back to the cleaned data array
    const cleanedDataWithHeader = [headerRow, ...cleanedData];

    // Return the cleaned data array
    return cleanedDataWithHeader;
  } else {
    // Return the cleaned data array
    return cleanedData;
  }
}

// Helper function to format the date as MM/DD/YYYY
function formatDate(dateString) {
  const dateParts = dateString.split('/');

  // Check if the date format is MM/DD/YY
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts;
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    const formattedYear = `20${year}`;
    return `${formattedMonth}/${formattedDay}/${formattedYear}`;
  }

  // Handle other date formats if needed

  // If none of the expected formats match, return the original date string
  return dateString;
}

function dumpCSV(cleanedData, filename) {
  // Convert cleaned data to CSV format
  const csvContent = cleanedData.map(row => row.join(',')).join('\n');

  // Create a Blob object with CSV content
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element for the download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Prompt the user to download the file
  link.click();

  // Clean up the temporary URL and link element
  URL.revokeObjectURL(url);
}

function extractUniqueDates(dataArray) {
  const uniqueDates = new Set();
  dataArray.forEach(row => {
    const date = row[0];
    uniqueDates.add(date);
  });

  const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));

  return sortedDates;
}

function populateDateList(dates) {
  const dateListContainer = document.getElementById('date_pane');

  // Create a <ul> element
  const dateList = document.createElement('ul');

  // Add a class to the <ul> element
  dateList.classList.add('date-list');

  // Loop through the dates and create <li> elements
  dates.forEach(date => {
    const listItem = document.createElement('li');
    listItem.textContent = date;

    // Add a click event listener to each list item
    listItem.addEventListener('click', async function () {
      // Remove the 'selected' class from all list items
      const listItems = document.querySelectorAll('.date-list li');
      listItems.forEach(item => item.classList.remove('selected'));

      // Add the 'selected' class to the clicked list item
      this.classList.add('selected');

      // Retrieve the selected date
      const selectedDate = this.textContent;
      // console.log('Selected Date:', selectedDate);

      const mapElement = document.getElementById('map');
      const source = mapElement.src;
      let selectedBuilding = null;

      if(source !== "img/scu_map.jpeg"){
        const buildingNum = source.substring(source.lastIndexOf('/') + 1, source.lastIndexOf('.'));
        selectedBuilding = getBuildingName(parseInt(buildingNum));
      }

      let dataArray = await getData();
      // Call a function to update the dashboard based on the selected date
      updateDashboard(dataArray, selectedDate, selectedBuilding);
    });

    dateList.appendChild(listItem);
  });

  // Append the <ul> element to the container
  dateListContainer.appendChild(dateList);
}

function generateBarGraph(buildings, weights) {
  const canvas = document.getElementById('barChart');

  // Create the chart using Chart.js
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: buildings,
      datasets: [
        {
          label: 'Weight of Trash Disposed',
          data: weights,
          backgroundColor: 'rgba(75, 192, 192, 0.8)', // Adjust the color as needed
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      // indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Weight (lbs)',
          },
        },
        x: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Function to update the dashboard with analysis results
function updateDashboard(cleanedData, selectedDate, selectedBuilding) {

  let aggregatedBuildingWeights = null;
  let aggregatedStreamWeights = null;
  let buildings = null;
  let weights = null;
  let streams = null;

  let filteredData = cleanedData;

  if (selectedDate && selectedBuilding) {
    filteredData = cleanedData.filter(row => row[0] === selectedDate && row[1] === selectedBuilding);
  } else if (selectedBuilding) {
    // Filter the data based on the selected building
    filteredData = cleanedData.filter(row => row[1] === selectedBuilding);
  } else if (selectedDate) {
    // Filter the data based on the selected date
    filteredData = cleanedData.filter(row => row[0] === selectedDate);
  }

  // Generate the bar graph based on the aggregated building weights
  aggregatedBuildingWeights = aggregateBuildingWeights(filteredData);
  buildings = Object.keys(aggregatedBuildingWeights);
  weights = Object.values(aggregatedBuildingWeights);

  generateBarGraph(buildings, weights);

  weights = buildings = streams = null;

  // Generate the bar graph based on the aggregated stream weights
  aggregatedStreamWeights = aggregateStreamWeights(filteredData);
  streams = Object.keys(aggregatedStreamWeights);
  weights = Object.values(aggregatedStreamWeights);

  generatePieChart(streams, weights);

  weights = buildings = streams = null;

}

function aggregateBuildingWeights(data) {
  const aggregatedWeights = {};

  data.forEach(row => {
    const building = row[1];
    const weight = row[7];

    if (!aggregatedWeights[building]) {
      aggregatedWeights[building] = 0;
    }

    aggregatedWeights[building] += weight;
  });

  return aggregatedWeights;
}

function aggregateStreamWeights(data) {
  const aggregatedWeights = {};

  data.forEach(row => {
    const stream = row[2];
    const weight = row[7];

    if (!aggregatedWeights[stream]) {
      aggregatedWeights[stream] = 0;
    }

    aggregatedWeights[stream] += weight;
  });

  return aggregatedWeights;
}

function generatePieChart(streams, weights) {
  const canvas = document.getElementById('pieChart');
  const colors = streams.map(() => generateRandomColor());

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: streams,
      datasets: [{
        label: 'Total Weight of Trash by Stream',
        data: weights,
        backgroundColor: colors,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });
}

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

async function reset(dataArray) {
  if(!dataArray) {
    dataArray = await getData();
  }
  updateDashboard(dataArray);
}
