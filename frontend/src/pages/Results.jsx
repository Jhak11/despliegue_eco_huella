import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { questionnaireService } from '../services/api'; // Import service to fetch data
import './Results.css';

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    // Constants for comparison (tons CO2e/year)
    const PERU_AVERAGE = 2000; // ~2.0 tons
    const WORLD_AVERAGE = 4500; // ~4.5 tons
    const GLOBAL_TARGET = 2000; // 2050 Target

    useEffect(() => {
        const loadResult = async () => {
            if (location.state?.result) {
                setResult(location.state.result);
                setLoading(false);
            } else {
                try {
                    // Try to fetch latest result from history
                    const history = await questionnaireService.getResults(1);
                    if (history && history.length > 0) {
                        const latest = history[0];
                        // Transform DB format to display format if needed
                        // Assuming API returns similar structure or mapping it here
                        setResult({
                            results: {
                                total: latest.total_footprint,
                                transport: latest.transport_score,
                                energy: latest.energy_score,
                                food: latest.food_score,
                                waste: latest.waste_score,
                                water: latest.water_score
                            },
                            comparison: {
                                // We calculate dynamic comparison below
                                regional_baseline: PERU_AVERAGE
                            }
                        });
                    }
                } catch (error) {
                    console.error("No previous results found", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadResult();
    }, [location]);

    if (loading) {
        return (
            <div className="results-container flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Persistent Info Panel Component
    const InfoPanel = () => (
        <div className="intro-text sticky-info">
            <h1>Tu Huella de Carbono</h1>
            <h2>¿Qué es y por qué importa?</h2>
            <p>
                La huella de carbono representa la cantidad total de gases de efecto invernadero (incluidos el dióxido de carbono y el metano)
                que son generados por nuestras acciones individuales.
            </p>
            <p>
                <strong>¿Por qué medirla?</strong><br />
                Entender tu impacto es el primer paso para reducirlo. Cada pequeña acción cuenta para combatir el cambio climático
                y preservar la biodiversidad de nuestro planeta.
            </p>
            <div className="intro-stats">
                <div className="stat-item">
                    <span className="stat-number">2.0t</span>
                    <span className="stat-label">Promedio Perú</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">4.5t</span>
                    <span className="stat-label">Promedio Global</span>
                </div>
            </div>
        </div>
    );

    const categories = [
        { key: 'transport', label: 'Transporte', icon: '🚗', color: '#0288d1' },
        { key: 'energy', label: 'Energía', icon: '⚡', color: '#ff9800' },
        { key: 'food', label: 'Alimentación', icon: '🍽️', color: '#4caf50' },
        { key: 'waste', label: 'Residuos', icon: '♻️', color: '#8d6e63' },
        { key: 'water', label: 'Agua', icon: '💧', color: '#4fc3f7' }
    ];

    // Analysis View Component
    const AnalysisView = ({ data }) => {
        const { results } = data;
        const maxValue = Math.max(...categories.map(c => results[c.key]));

        // Comparisons
        const vsPeru = ((results.total - PERU_AVERAGE) / PERU_AVERAGE) * 100;
        const vsWorld = ((results.total - WORLD_AVERAGE) / WORLD_AVERAGE) * 100;

        let comment = "";
        if (results.total <= 2000) comment = "¡Excelente! Tu huella es sostenible y ejemplar.";
        else if (results.total <= 4000) comment = "Vas por buen camino, pero aún hay margen de mejora.";
        else comment = "Tu huella es alta. Pequeños cambios pueden hacer una gran diferencia.";

        return (
            <div className="analysis-content fade-in">
                <div className="results-header text-center mb-3">
                    <h2>Análisis de tu Huella</h2>
                    <p>Resultados detallados y comparativas</p>
                </div>

                {/* Main Result & Commentary */}
                <div className="result-hero-section card mb-3">
                    <div className="hero-grid">
                        <div className="total-display">
                            <div className="total-icon-large"></div>
                            <div className="total-number">
                                {results.total.toLocaleString()}
                                <span className="unit">kg CO₂e</span>
                            </div>
                            <div className="total-label">Tu Huella Anual</div>
                        </div>
                        <div className="comparison-display">
                            <h3>{comment}</h3>

                            <div className="comparison-row">
                                <div className="comp-item">
                                    <span className="comp-label">Promedio Perú</span>
                                    <span className="comp-val">{PERU_AVERAGE.toLocaleString()} kg</span>
                                    <span className={`comp-tag ${vsPeru > 0 ? 'bad' : 'good'}`}>
                                        {vsPeru > 0 ? `+${vsPeru.toFixed(0)}%` : `${vsPeru.toFixed(0)}%`}
                                    </span>
                                </div>
                                <div className="comp-item">
                                    <span className="comp-label">Promedio Mundial</span>
                                    <span className="comp-val">{WORLD_AVERAGE.toLocaleString()} kg</span>
                                    <span className={`comp-tag ${vsWorld > 0 ? 'bad' : 'good'}`}>
                                        {vsWorld > 0 ? `+${vsWorld.toFixed(0)}%` : `${vsWorld.toFixed(0)}%`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="breakdown-section mb-3">
                    <h2 className="mb-2">Desglose por Categoría</h2>
                    <div className="categories-grid">
                        {categories.map(category => {
                            const value = results[category.key];
                            const percentage = (value / results.total * 100).toFixed(1);
                            const barWidth = (value / maxValue * 100);

                            return (
                                <div key={category.key} className="category-card card">
                                    <div className="category-header">
                                        <div className="category-icon" style={{ backgroundColor: category.color }}>
                                            {category.icon}
                                        </div>
                                        <div className="category-info">
                                            <h3>{category.label}</h3>
                                            <div className="category-value">{value.toLocaleString()} kg</div>
                                        </div>
                                    </div>
                                    <div className="category-bar-container">
                                        <div
                                            className="category-bar"
                                            style={{ width: `${barWidth}%`, backgroundColor: category.color }}
                                        ></div>
                                    </div>
                                    <div className="category-percentage">{percentage}% del total</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations-section card mb-3">
                    <h2>Recomendaciones Personalizadas</h2>
                    <ul className="recommendations-list">
                        {results.transport > 1000 && <li>Usa transporte público o bicicleta para reducir tus {results.transport}kg de emisiones por transporte.</li>}
                        {results.energy > 800 && <li>Desconecta aparatos en standby. Tu consumo energético ({results.energy}kg) es considerable.</li>}
                        {results.food > 1500 && <li>Intenta 'Lunes sin carne'. Tu dieta genera {results.food}kg de CO₂.</li>}
                        {results.waste > 400 && <li>Composta tus residuos orgánicos. {results.waste}kg de residuos pueden reducirse.</li>}
                        {results.total < 3000 && <li>¡Sigue así! Comparte tus hábitos sostenibles con amigos.</li>}
                    </ul>
                </div>

                <div className="actions-section text-center">
                    <button className="btn btn-secondary" onClick={() => navigate('/questionnaire')}>
                        Recalcular Huella
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="results-container fade-in">
            <div className="results-layout-grid">
                {/* Left Column: Persistent Info */}
                <div className="info-column">
                    <InfoPanel />
                </div>

                {/* Right Column: Dynamic Content */}
                <div className="content-column">
                    {!result ? (
                        <div className="intro-action-container">
                            <div className="action-card card">
                                <div className="action-icon"></div>
                                <h3>¡Descubre tu Impacto!</h3>
                                <p>Realiza nuestro cuestionario rápido para calcular tu huella ambiental detallada.</p>
                                <button className="btn btn-primary btn-large" onClick={() => navigate('/questionnaire')}>
                                    Calcular mi Huella Ahora
                                </button>
                            </div>
                        </div>
                    ) : (
                        <AnalysisView data={result} />
                    )}
                </div>
            </div>
        </div>
    );
}
