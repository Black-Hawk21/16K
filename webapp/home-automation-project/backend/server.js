const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const thingSpeakWriteApiKey = 'N7R08OX4IIFHT230';
const thingSpeakReadApiKey = 'AXS1PZ2BMIYSSZHX';
const thingSpeakChannelId = '2665045';

app.get('/api/thingspeak', async (req, res) => {
    try {
        const response = await axios.get(`https://api.thingspeak.com/channels/2665045/feeds.json?api_key=AXS1PZ2BMIYSSZHX&results=1`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching from ThingSpeak:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch data from ThingSpeak' });
    }
});

app.post('/api/thingspeak', async (req, res) => {
    try {
        const { field1, field2, field3, field4, field5, field6, field7 } = req.body;
        const url = `https://api.thingspeak.com/update?api_key=N7R08OX4IIFHT230`;
        const params = new URLSearchParams({
            field1: field1 || '',
            field2: field2 || '',
            field3: field3 || '',
            field4: field4 || '',
            field5: field5 || '',
            field6: field6 || '',
            field7: field7 || ''
        });
        const response = await axios.post(`${url}&${params.toString()}`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error updating ThingSpeak:', error);
        res.status(500).json({ success: false, error: 'Failed to update ThingSpeak' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});