import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, PerspectiveCamera } from '@react-three/drei';
import './ARViewer.css';

/**
 * AR Viewer Component
 * Provides AR mode with camera feed and 3D model overlay
 */
export default function ARViewer({ children, isActive, onClose }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null); // Ref to hold stream for cleanup
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isActive) {
            startAR();
        } else {
            stopAR();
        }

        return () => stopAR();
    }, [isActive]);

    const startAR = async () => {
        try {
            // Stop any existing stream first
            stopAR();

            // Request camera access (rear camera for AR)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            streamRef.current = mediaStream; // Store in ref

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(e => console.error("Video play failed", e));
            }
            setError(null);
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
            // Don't close immediately so user sees error
        }
    };

    const stopAR = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log("Track stopped:", track.label);
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    if (!isActive) return null;

    return (
        <div className="ar-viewer-container">
            {/* Camera feed background */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="ar-video-feed"
            />

            {/* 3D Canvas overlay */}
            <div className="ar-canvas-overlay">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <Environment preset="sunset" />
                    {children}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={true}
                        minDistance={2}
                        maxDistance={10}
                    />
                </Canvas>
            </div>

            {/* AR Controls */}
            <div className="ar-controls">
                <button className="ar-close-btn" onClick={onClose}>
                    ✕ Cerrar AR
                </button>
                <div className="ar-instructions">
                    📱 Mueve tu dispositivo para ver a Golemino en tu entorno
                </div>
            </div>

            {error && (
                <div className="ar-error">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
