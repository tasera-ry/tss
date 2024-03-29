import React, { Component } from 'react';
import styles from './ButtonComponent.module.scss';
import Button from '@material-ui/core/Button';

class ButtonComponent extends Component {
    render() {
        return (
            <div className={styles.singularGrid}>
                <Button className={styles.customButton}>Timer 1</Button>
                <Button className={styles.customButton}>Timer 2</Button>
                <Button className={styles.customButton}>Labradar</Button>
            </div>
        );
    }
}
export default ButtonComponent;