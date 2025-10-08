import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RoleDropdown.module.css';
import { IconChevronDown } from '../../utils/Icons';

const RoleDropdown = ({ role, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const roles = ['USER', 'ORGANIZER', 'ADMIN'];

    const handleSelect = (newRole) => {
        onChange(newRole);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownContainer}>
            <button 
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span>{role}</span>
                <IconChevronDown />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className={styles.dropdownMenu}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {roles.map(r => (
                            <div 
                                key={r}
                                className={styles.dropdownItem}
                                onClick={() => handleSelect(r)}
                            >
                                {r}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleDropdown;
