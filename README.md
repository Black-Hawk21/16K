# Smart Home Automation Project

## Overview

This project implements a smart home automation system for better energy usage and real-time energy tracking. It combines IoT devices, a web dashboard, and machine learning for energy prediction.

## Features

- Real-time monitoring of home devices (lights, AC, door locks)
- Temperature and brightness sensing
- Energy usage tracking and visualization
- Machine learning model for energy usage prediction
- Web-based dashboard for device control and monitoring
- Energy saving features
    - ML model that that predicts future energy usage using past trends to alert you according to your current energy consumption.
    - Electrical appliances only turn on when there are people in the room and turn off when everyone has left the room.
    - We are reading brightness and temperature values from sensors to the web app which can be used to add further appliance restrictions and controls to save more energy.

## Components

### 1. IoT Hardware (Arduino)

The IoT setup uses an ESP32 microcontroller with the following sensors and components:

- Ultrasonic sensors for occupancy detection
- DHT11 sensor for temperature and humidity
- Photoresistor for ambient light sensing

### 2. Web Dashboard (React)

A React-based dashboard for monitoring and controlling smart home devices. Features include:

- Real-time device status updates
- Toggle controls for lights and AC
- Temperature control for AC
- Door lock status
- Ambient sensor readings display for temperature and lighting
- Real time electricity usage graph

### 3. Machine Learning Model

A machine learning model that predicts future energy usage based on historical data.

## Setup and Installation

### IoT Hardware Setup

1. Connect the sensors and relays to the ESP32 as per the pin configuration in the Arduino code.
2. Install the required libraries:
   - WiFi
   - HTTPClient
   - ArduinoJson
   - DHT sensor library
3. Update the Wi-Fi credentials and ThingSpeak API keys in the Arduino code.
4. Upload the code to your ESP32 board.

### Web Dashboard Setup

1. Ensure you have Node.js installed.
2. Navigate to the project directory and run:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Access the dashboard at `http://localhost:3000`

## Usage

1. Power on the IoT devices.
2. Open the web dashboard to monitor and control your smart home devices.
3. Use the dashboard to:
   - Toggle lights on/off
   - Adjust AC temperature and power
   - View ambient temperature and brightness
   - Track real-time energy usage

## Future Enhancements

- Integration with voice assistants
- Mobile app development
- Expanded sensor network for more detailed home monitoring
- Advanced energy-saving algorithms based on usage patterns

## Contributors

- [Snehal Sharma](https://github.com/SnehalSharma05)
- [Shubhranil Basak](https://github.com/Black-Hawk21)
- [Hemanth Mada](https://github.com/Hemanth-Mada)

For more details on individual contributions, please visit the contributors' GitHub profiles.
