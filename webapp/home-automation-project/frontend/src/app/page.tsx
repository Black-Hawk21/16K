"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { LightbulbIcon, ThermometerIcon, LockIcon, SunIcon, DropletIcon } from 'lucide-react';
import ElectricityUsageGraph from './ElectricityUsageGraph';
import { parse } from 'path';
const Dashboard = () => {
  interface Device {
    id: string;
    name: string;
    type: 'light' | 'thermostat' | 'lock' | 'ambient';
    status: number;
    value: number;
  }

  const [devices, setDevices] = useState<Device[]>([]);
  const [ambientTemp, setAmbientTemp] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(0);

  useEffect(() => {
    fetchDeviceStates();
    const intervalId = setInterval(fetchDeviceStates, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchDeviceStates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/thingspeak');
      const data = await response.json();
      if (data.success && data.data.feeds && data.data.feeds.length > 0) {
        const latestFeed = data.data.feeds[data.data.feeds.length - 1];
        updateDevicesFromThingSpeak(latestFeed);
      } else {
        setDefaultDevices();
      }
    } catch (error) {
      console.error('Error fetching device states:', error);
      setDefaultDevices();
    }
  };

  const setDefaultDevices = () => {
    setDevices([
      { id: '1', name: 'Living Room Light', type: 'light', status: 0, value: 0 },
      { id: '2', name: 'AC', type: 'thermostat', status: 0, value: 20 },
      { id: '3', name: 'Door', type: 'lock', status: 0, value: 0 },
      { id: '4', name: 'Ambient Sensors', type: 'ambient', status: 1, value: 0 },
    ]);
    setAmbientTemp(0);
    setBrightness(0);
  };

  interface ThingSpeakFeed {
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field6: string;
    field7: string;
  }

  const updateDevicesFromThingSpeak = (feed: ThingSpeakFeed) => {
    const updatedDevices: Device[] = [
      { id: '1', name: 'Living Room Light', type: 'light', status: feed.field1 === '1' ? 1 : 0, value: 0 },
      { id: '2', name: 'AC', type: 'thermostat', status: feed.field4 === '1' ? 1 : 0, value: parseFloat(feed.field2) },
      { id: '3', name: 'Door', type: 'lock', status: feed.field3 === '1' ? 1 : 0, value: 0 },
      { id: '4', name: 'Ambient Sensors', type: 'ambient', status: parseFloat(feed.field7), value: parseFloat(feed.field6) },
    ];
    setDevices(updatedDevices);
    setAmbientTemp(parseFloat(feed.field6));
    setBrightness(parseFloat(feed.field7));
  };


  const sendDeviceUpdate = async (deviceType: 'light' | 'thermostat' | 'lock' | 'ambient', value: number, status: number) => {
    try {
      const currentDevices = [...devices];
      let field1 = currentDevices.find(d => d.type === 'light')?.status.toString();
      let field2 = currentDevices.find(d => d.type === 'thermostat')?.value.toString() || '0';
      let field3 = currentDevices.find(d => d.type === 'lock')?.status.toString();
      let field4 = currentDevices.find(d => d.type === 'thermostat')?.status.toString();
      let field6 = currentDevices.find(d => d.type === 'ambient')?.value.toString() || '0';
      let field7 = currentDevices.find(d => d.type === 'ambient')?.status.toString() || '0';

      if (deviceType === 'light') field1 = status.toString();
      if (deviceType === 'thermostat') { field2 = value.toString(); field4 = status.toString(); }
      if (deviceType === 'lock') field3 = status.toString();
      if (deviceType === 'ambient') field6 = value.toString();
      if (deviceType === 'ambient') field7 = status.toString();

      const response = await fetch('http://localhost:3001/api/thingspeak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field1, field2, field3, field4, field6, field7 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update device');
      }

      // Update local state
      const updatedDevices = currentDevices.map(device => {
        //update both value and status for thermostat
        if (device.type === deviceType) {
          return { ...device, value, status };  // Update value for thermostat
        }
        return device;
      });
      setDevices(updatedDevices);

      // Fetch the latest state after a short delay
      setTimeout(fetchDeviceStates, 2000);
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };


  const toggleDevice = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      if (device.status === 1) {
        sendDeviceUpdate(device.type, device.value, 0/*status*/);  // Turn off the light
      } else {
        sendDeviceUpdate(device.type, device.value, 1/*status*/);  // Turn on the light
      }
    }
  };



  const updateThermostat = (id: string, newValue: number, stat: number) => {
    sendDeviceUpdate('thermostat', newValue, stat);
  };
  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Smart Home Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => (
          <Card key={device.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl font-semibold text-gray-700">{device.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {device.type === 'light' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LightbulbIcon className={`w-8 h-8 ${device.status === 1 ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <span className="ml-3 text-lg">{device.status === 1 ? 'On' : 'Off'}</span>
                  </div>
                  <Switch
                    checked={device.status === 1}
                    onCheckedChange={() => toggleDevice(device.id)}
                    className="scale-125"
                  />
                </div>
              )}
              {device.type === 'thermostat' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ThermometerIcon className={`w-8 h-8 ${device.status === 1 ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="ml-3 text-lg">{device.status === 1 ? 'On' : 'Off'}</span>
                    </div>
                    <Switch
                      checked={device.status === 1}
                      onCheckedChange={() => toggleDevice(device.id)}
                      className="scale-125"
                    />
                  </div>
                  {device.status === 1 && (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-center">{device.value}°C</div>
                      <Slider
                        value={[device.value]}
                        min={16}
                        max={30}
                        step={1}
                        onValueChange={(value: number[]) => updateThermostat(device.id, value[0], device.status)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
              {device.type === 'lock' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LockIcon className={`w-8 h-8 ${device.status === 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="ml-3 text-lg">{device.status === 1 ? 'Locked' : 'Unlocked'}</span>
                  </div>
                  <Switch
                    checked={device.status === 1}
                    onCheckedChange={() => toggleDevice(device.id)}
                    className="scale-125"
                  />
                </div>
              )}
              {device.type === 'ambient' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ThermometerIcon className="w-8 h-8 text-blue-500" />
                      <span className="ml-3 text-lg">Temperature</span>
                    </div>
                    <span className="text-2xl font-bold">{ambientTemp}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SunIcon className="w-8 h-8 text-yellow-500" />
                      <span className="ml-3 text-lg">Brightness</span>
                    </div>
                    <span className="text-2xl font-bold">{brightness} lux</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DropletIcon className="w-8 h-8 text-blue-400" />
                      <span className="ml-3 text-lg">Humidity</span>
                    </div>
                    <span className="text-2xl font-bold">45%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <ElectricityUsageGraph devices={devices} />
      </div>
    </div>
  );
};
export default Dashboard;
