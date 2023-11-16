const axios = require('axios');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: `http://${process.env.ELASTICSEARCH_URL}`,
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    },
});

const weatherApiUrl = 'https://api.weatherapi.com/v1/current.json';
const API_KEY = process.env.API_KEY;
const locations = ['London', 'Barcelona', 'Amsterdam', 'Lisbon', 'Paris'];

async function fetchData(location) {
    try {
        const response = await axios.get(`${weatherApiUrl}?key=${API_KEY}&q=${location}`);
        const weatherData = response.data;

        const metadata = {
            podName: process.env.POD_NAME || 'unknown_pod',
            nodeName: process.env.NODE_NAME || 'unknown_node',
        };

        const document = {
            date: new Date(),
            location,
            weather: weatherData,
            metadata,
        };

        await client.index({
            index: 'weather_data',
            body: document,
        });

        console.log(`Data for ${location} sent to Elasticsearch.`);
    } catch (error) {
        console.error(`Error fetching data for ${location}:`, error.message);
    }
}

// Run the function every 5 minutes
async function fetchAndStoreData() {
    for (const location of locations) {
        await fetchData(location);
    }
}

setInterval(fetchAndStoreData, 5 * 60 * 1000);

// Run the function immediately on startup
fetchAndStoreData();
