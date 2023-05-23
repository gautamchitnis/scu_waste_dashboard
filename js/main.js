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
  const csvFile = 'data/data.csv'; // Replace 'data.csv' with the path to your CSV file

  // Call the loadCSV function to start loading and processing the CSV file
  let dataArray = await loadCSV(csvFile);
  dataArray = cleanCSV(dataArray);

  // The dataArray is available here
  // console.log(dataArray);
  const filename = 'cleaned_data.csv';
  dumpCSV(dataArray, filename);

  // Perform analysis and visualization with the 'dataArray' as needed
  // analyzeData(dataArray); // You need to implement the 'analyzeData' function

  // Update the dashboard with the analysis results
  // updateDashboard(dataArray); // You need to implement the 'updateDashboard' function
});

// Function to update the map based on the clicked button
function updateMap(buildingNumber) {
  // Generate the image filename based on the building number
  const imageFilename = `${buildingNumber}.png`;

  // Set the image source
  const mapImage = document.getElementById('map');
  mapImage.src = `img/${imageFilename}`;
  mapImage.alt = `Map for Building ${buildingNumber}`;
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

function cleanCSV(dataArray) {
  // Extract the header row from the original data
  const headerRow = dataArray[0];

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

    // Return the cleaned row as an array
    return [date, cleanedRow[1], cleanedRow[2], cleanedRow[3], volume, weight];
  });

  // Add the header row back to the cleaned data array
  const cleanedDataWithHeader = [headerRow.slice(0, -1), ...cleanedData];

  // Return the cleaned data array
  return cleanedDataWithHeader;
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
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

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

// Function to analyze the CSV data
function analyzeData(dataArray) {
  // Implement the logic to analyze the CSV data
  // Perform any calculations, aggregations, or data manipulations as needed
}

// Function to update the dashboard with analysis results
function updateDashboard(dataArray) {
  // Implement the logic to update the dashboard with the analysis results
  // Update HTML elements, charts, or any other components with the analyzed data
}
