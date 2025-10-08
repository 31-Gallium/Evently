import React from 'react';
import styles from './ToggleSwitch.module.css';

const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles.reactSwitchCheckbox}
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        style={{ background: isOn && '#06D6A0' }}
        className={styles.reactSwitchLabel}
        htmlFor={`react-switch-new`}
      >
        <span className={styles.reactSwitchButton} />
      </label>
    </>
  );
};

export default ToggleSwitch;