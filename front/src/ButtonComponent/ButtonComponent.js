import React, { Component, useState } from 'react';
import styles from './ButtonComponent.module.scss';
import Button from '@material-ui/core/Button';
import api from '../api/api';
import translations from '../texts/texts.json';
// Class for buttoncomponent for dayview.js to see states of loan devices
class ButtonComponent extends Component {
    state = {
        items: [],
    };

    componentDidMount() {
        this.fetchDevices();
    }

    fetchDevices = async () => {
        // Fetching device data
        try {
            const response = await api.getAllDevices();
            this.setState({ items: response });
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    handleStatusChange = async (device) => {
        // Copy the current devices state
        const devicesUpdated = this.state.items.map(item => {
            if (item.id === device.id) {
                return { ...item, status: item.status === 'free' ? 'reserved' : 'free' };
            }
            return item;
        });

        try {
            // Returns the updated device
            await api.patchDevice(device.id, { status: device.status === 'free' ? 'reserved' : 'free' });
            this.setState({ items: devicesUpdated });
        } catch (error) {
            console.error('Error updating device status:', error);
        }
    };

    toggleText = (id) => {
        // On click changes text on button showing if 'free' or 'reserved'
        this.setState(prevState => ({
            items: prevState.items.map(device => 
                device.id === id ? { ...device, toggleText: !device.toggleText } : device
            ),
        }));
    };

    render() {
        //Updates loan devices on a grid in dayview.js
        const lang = localStorage.getItem('language');
        const { devices } = translations;
        const { items } = this.state;

        if (items.length > 0) {
            return (
                <div className={styles.singularGrid}>
                    {items.map((device) => (
                        <div key={device.id}>
                            <Button 
                            className={`${device.status === 'reserved' ? styles.reservedButton : styles.freeButton}`}
                            onClick={() => this.toggleText(device.id)}
                            >
                                {device.toggleText ? (device.status === 'reserved' ? devices.Updated.ReservedStatus[lang] : devices.FreeStatus[lang]) : device.device_name}
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