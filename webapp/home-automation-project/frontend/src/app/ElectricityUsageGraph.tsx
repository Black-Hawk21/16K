import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEVICE_POWER: { [key: string]: number } = {
    light: 60, // 60W
    thermostat: 1000, // 1000W
    lock: 5, // 5W
};

interface Device {
    type: string;
    status: number;
}

interface ElectricityUsageGraphProps {
    devices: Device[];
}

const ElectricityUsageGraph: React.FC<ElectricityUsageGraphProps> = ({ devices }) => {
    interface UsageDataPoint {
        time: string;
        usage: number;
    }

    const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const newDataPoint = {
                time: new Date().toLocaleTimeString(),
                usage: calculateTotalUsage(devices),
            };
            setUsageData(prevData => [...prevData.slice(-19), newDataPoint]);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [devices]);

    const calculateTotalUsage = (devices: Device[]) => {
        return devices.reduce((total, device) => {
            if (device.status === 1) {
                return total + (DEVICE_POWER[device.type] || 0);
            }
            return total;
        }, 0);
    };

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl font-semibold text-gray-700">Real-time Electricity Usage</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={usageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="usage" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ElectricityUsageGraph;