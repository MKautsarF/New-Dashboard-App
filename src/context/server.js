const express = require('express');
const dgram = require('dgram');
const cors = require('cors');

const app = express();
const port = 8003;
const udpPort = 1234; // Replace with your UDP port
const udpAddress = '192.168.10.40'; // Replace with your UDP IP address

app.use(cors());
let currentValue = 0;

// Set up UDP client
const udpClient = dgram.createSocket('udp4');

// Listen for incoming UDP messages
udpClient.on('message', (msg) => {
    currentValue = msg.readUInt8(0); // Assuming the message is a single uint8_t
});

// When sending a message to the device
const message = Buffer.from([0]); // Example message
udpClient.send(message, 0, message.length, 4321, udpAddress, (err) => {
    if (err) console.error('Error sending message:', err);
});

udpClient.bind(udpPort, udpAddress);

// Endpoint to get the current value
app.get('/value', (req, res) => {
    res.json({ value: currentValue });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
