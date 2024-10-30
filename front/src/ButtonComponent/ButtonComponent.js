import React, { Component } from 'react';
import styles from './ButtonComponent.module.scss';
import Button from '@mui/material/Button';
import api from '../api/api';
import translations from '../texts/texts.json';

// Class for buttoncomponent for dayview.js to see states of loan devices
class ButtonComponent extends Component {
    state = {
        items: [],
        hoveredDeviceId: null,
        isMobile: false,
    };

    sortDevices = (devices) => {
        // Function for sorting devices alphabetically
        return devices.sort((a, b) => a.device_name.localeCompare(b.device_name));
      };

    componentDidMount() {
        this.fetchDevices();
        this.setState({ isMobile: this.isMobileDevice() });
    }

    isMobileDevice = () => {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    handleMouseEnter = (id) => {
        if (!this.state.isMobile) {
            this.setState({ hoveredDeviceId: id });
        }
    };

    handleMouseLeave = () => {
        if (!this.state.isMobile) {
            this.setState({ hoveredDeviceId: null });
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

    handleClick = (id) => {
        if (this.state.isMobile) {
            this.toggleText(id);
        }
    };

    fetchDevices = async () => {
        // Fetching device data
        try {
            const response = await api.getAllDevices();
            const sortedDevices = this.sortDevices(response);
            this.setState({ items: sortedDevices });
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
        })

        try {
            // Returns the updated device
            await api.patchDevice(device.id, { status: device.status === 'free' ? 'reserved' : 'free' });
            const sortedItems = this.sortDevices(devicesUpdated);
            this.setState({ items: sortedItems });
        } catch (error) {
            console.error('Error updating device status:', error);
        }
    };

    render() {
        //Updates loan devices on a grid in dayview.js
        const lang = localStorage.getItem('language');
        const { devicesList } = translations;
        const { items, hoveredDeviceId } = this.state;

        if (items.length > 0) {
            return (
                <div className={styles.singularGrid}>
                    {items.map((device) => (
                        <div key={device.id}>
                            <Button variant="contained"
                            className={`${device.status === 'reserved' ? styles.reservedButton : styles.freeButton}`}
                            onMouseEnter={() => this.handleMouseEnter(device.id)}
                            onMouseLeave={this.handleMouseLeave}
                            onClick={() => this.handleClick(device.id)}
                            disableElevation
                            >
                                {hoveredDeviceId === device.id || device.toggleText
                                    ? (device.status === 'reserved' ? devicesList.ReservedStatus[lang] : devicesList.FreeStatus[lang])
                                    : device.device_name}
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