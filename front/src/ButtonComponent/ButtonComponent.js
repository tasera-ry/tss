import React, { Component, useState } from 'react';
import styles from './ButtonComponent.module.scss';
import Button from '@material-ui/core/Button';
import api from '../api/api';

class ButtonComponent extends Component {
    state = {
        devices: [],
    };

    componentDidMount() {
        this.fetchDevices();
    }

    fetchDevices = async () => {
        try {
            const response = await api.getAllDevices();
            this.setState({ devices: response });
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    handleStatusChange = async (device) => {
        // Copy the current devices state
        const devicesUpdated = this.state.devices.map(item => {
            if (item.id === device.id) {
                return { ...item, status: item.status === 'free' ? 'reserved' : 'free' };
            }
            return item;
        });

        try {
            // Assuming patchDevice returns the updated device, else just use devicesUpdated directly
            await api.patchDevice(device.id, { status: device.status === 'free' ? 'reserved' : 'free' });
            this.setState({ devices: devicesUpdated });
        } catch (error) {
            console.error('Error updating device status:', error);
        }
    };

    render() {
        const { devices } = this.state;

        if (devices.length > 0) {
            return (
                <div className={styles.singularGrid}>
                    {devices.map((device) => (
                        <div key={device.id}>
                            <Button className={styles.customButton}>
                                {device.device_name}
                            </Button>
                        </div>
                    ))}
                </div>
            );
        }

        // Render when there are no devices or if devices are still being fetched
        return (
            <div className={styles.singularGrid}>
                <Button className={styles.customButton}>Fetching Devices...</Button>
            </div>
        );
    }
}

export default ButtonComponent;