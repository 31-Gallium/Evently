import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import styles from './Particles.module.css';
import particleConfig from './particles-config';

const ParticlesComponent = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

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
