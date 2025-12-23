import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { gamificationService } from '../services/gamificationService';
import './Golemino.css';

// 3D Model Component
const GoleminoModel = () => {
    // Load the .glb file
    const { scene } = useGLTF('/models/golemino.glb');
    return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
};

export default function Golemino() {
    const [stats, setStats] = useState(null);
    const [arMode, setArMode] = useState(false);
    const [healing, setHealing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await gamificationService.getGamifiedProfile();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleHeal = async () => {
        setHealing(true);
        try {
            const response = await gamificationService.healGolemino();
            setMessage(response.message);
            loadStats(); // Reload to see updated coins and status
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error al curar');
        } finally {
            setHealing(false);
        }
    };

    const toggleAR = async () => {
        if (!arMode) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                const videoElement = document.getElementById('ar-video-feed');
                if (videoElement) {
                    videoElement.srcObject = stream;
                }
                setArMode(true);
            } catch (err) {
                alert("No se pudo acceder a la cámara para AR");
            }
        } else {
            setArMode(false);
            // Stop tracks
            const videoElement = document.getElementById('ar-video-feed');
            if (videoElement && videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }
        }
    };

    if (!stats) return <div className="loading">Cargando Golemino...</div>;

    const isSick = stats.golemino_status === 'sick';

    return (
        <div className={`golemino-container ${arMode ? 'ar-active' : ''}`}>

            {/* AR Background Layer */}
            {arMode && <video id="ar-video-feed" autoPlay playsInline muted className="ar-video-background"></video>}

            <div className="golemino-header">
                <h1>Golemino (Bebé)</h1>
                <div className={`status-badge ${isSick ? 'sick' : 'healthy'}`}>
                    {isSick ? '🤒 Enfermo' : '❤️ Sano'}
                </div>
            </div>

            <div className="viewer-3d-wrapper">
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6}>
                            <GoleminoModel />
                        </Stage>
                        <OrbitControls autoRotate={!isSick} />
                    </Suspense>
                </Canvas>
                {/* Overlay FX for sickness */}
                {isSick && <div className="sick-overlay">🦠</div>}
            </div>

            <div className="controls-panel card">
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="icon">🪙</span>
                        <span className="val">{stats.coins} Brotos</span>
                    </div>
                </div>

                <div className="actions-row">
                    <button className="btn btn-secondary" onClick={toggleAR}>
                        {arMode ? '🔲 Modo 3D' : '📷 Modo AR'}
                    </button>

                    {isSick ? (
                        <button
                            className="btn btn-primary btn-heal"
                            onClick={handleHeal}
                            disabled={healing || stats.coins < 50}
                        >
                            {healing ? 'Curando...' : '💊 Curar (50 Brotos)'}
                        </button>
                    ) : (
                        <button className="btn btn-disabled" disabled>
                            ✨ Golemino está feliz
                        </button>
                    )}
                </div>
                {message && <div className="feedback-msg fade-in">{message}</div>}
            </div>
        </div>
    );
}
