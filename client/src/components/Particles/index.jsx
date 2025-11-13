import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import styles from './Particles.module.css';
import particleConfig from './particles-config';

const ParticlesComponent = () => {
    const particlesInit = async (main) => {
        await loadFull(main);
    };

    return (
        <div className={styles.particlesContainer}>
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particleConfig}
            />
        </div>
    );
};

export default ParticlesComponent;
