import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../pages/Education.css';

export default function TopicViewer({ topic, onClose, onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = topic.slides;
    const isLastSlide = currentSlide === slides.length - 1;

    const nextSlide = () => {
        if (isLastSlide) {
            onComplete();
        } else {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const slide = slides[currentSlide];

    return (
        <div className="topic-viewer-overlay">
            <motion.div
                className="topic-viewer-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className="viewer-header">
                    <span className="topic-title">{topic.title}</span>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="viewer-progress">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    ></div>
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        className="slide-content"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Slide Types Rendering */}
                        <div className={`slide-body type-${slide.type}`}>
                            <h2 className="slide-title">{slide.title}</h2>
                            {slide.subtitle && <h3 className="slide-subtitle">{slide.subtitle}</h3>}

                            {slide.text && <p className="slide-text">{slide.text}</p>}

                            {slide.list && (
                                <ul className="slide-list">
                                    {slide.list.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            )}

                            {slide.cards && (
                                <div className="slide-grid">
                                    {slide.cards.map((card, idx) => (
                                        <div key={idx} className="grid-card">
                                            <span className="card-icon">{card.icon}</span>
                                            <div className="card-info">
                                                <h4>{card.title}</h4>
                                                <p>{card.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {slide.highlight && (
                                <div className="slide-highlight">
                                    💡 {slide.highlight}
                                </div>
                            )}

                            {slide.subtext && <p className="slide-subtext">{slide.subtext}</p>}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="viewer-footer">
                    <button
                        className="btn-nav prev"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                    >
                        ← Atrás
                    </button>

                    <button className="btn-nav next" onClick={nextSlide}>
                        {slide.buttonText || (isLastSlide ? 'Finalizar' : 'Siguiente →')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
