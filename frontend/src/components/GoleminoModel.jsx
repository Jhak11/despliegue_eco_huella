import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

/**
 * 3D Golemino Model Component
 * Loads different models based on phase and applies animations based on health status
 */
export default function GoleminoModel({ phase = 'baby', status = 'healthy', health = 100 }) {
    const group = useRef();

    // Map phase to model path (using placeholder for now)
    // Map phase to model path
    const modelPaths = {
        baby: '/models/golemino_baby.glb',
        young: '/models/golemino_young.glb',
        titan: '/models/golemino_titan.glb'
    };

    // Load the model (Suspense will handle loading state)
    const gltf = useGLTF(modelPaths[phase]);

    // Only use animations if we have them
    const { actions } = useAnimations(gltf?.animations || [], group);

    useEffect(() => {
        // Play animations based on status
        if (actions && Object.keys(actions).length > 0) {
            if (status === 'healthy' && actions.idle) {
                actions.idle.play();
            } else if (status.startsWith('sick') && actions.sick) {
                actions.sick.play();
            }
        }
    }, [status, actions]);

    // Scale based on phase
    const scales = {
        baby: 1,
        young: 1.5,
        titan: 2.2
    };

    // Color tint based on health
    const getHealthColor = () => {
        if (health >= 80) return '#4ade80'; // green
        if (health >= 60) return '#fbbf24'; // yellow
        if (health >= 40) return '#fb923c'; // orange
        return '#ef4444'; // red
    };

    // If model doesn't exist or failed to load, show placeholder
    if (!gltf || !gltf.scene) {
        return (
            <mesh ref={group} scale={scales[phase]}>
                <boxGeometry args={[1, 1.5, 1]} />
                <meshStandardMaterial
                    color={getHealthColor()}
                    roughness={0.7}
                    metalness={0.3}
                />
            </mesh>
        );
    }

    return (
        <primitive
            ref={group}
            object={gltf.scene}
            scale={scales[phase]}
            position={[0, -1, 0]}
        />
    );
}

// Don't preload models that don't exist yet
// Uncomment these when you add the actual .glb files
// useGLTF.preload('/models/golemino_baby.glb');
// useGLTF.preload('/models/golemino_young.glb');
// useGLTF.preload('/models/golemino_titan.glb');

