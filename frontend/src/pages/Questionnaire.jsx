import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireService } from '../services/api';
import './Questionnaire.css';

export default function Questionnaire() {
    const [questionnaire, setQuestionnaire] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadQuestionnaire();
    }, []);

    const loadQuestionnaire = async () => {
        try {
            const data = await questionnaireService.getQuestionnaire();
            setQuestionnaire(data);
        } catch (err) {
            setError('Error al cargar el cuestionario');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
    };

    const handleNext = () => {
        if (currentQuestion < questionnaire.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            const result = await questionnaireService.submitQuestionnaire(answers);
            navigate('/results', { state: { result } });
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar el cuestionario');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="questionnaire-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!questionnaire) {
        return (
            <div className="questionnaire-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    const question = questionnaire.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questionnaire.questions.length) * 100;
    const isAnswered = answers[question.id] !== undefined;
    const isLastQuestion = currentQuestion === questionnaire.questions.length - 1;
    const allAnswered = questionnaire.questions.every(q => answers[q.id] !== undefined);

    // Get category info
    const categoryInfo = {
        transport: {  name: 'Transporte', color: '#0288d1' },
        energy: { name: 'Energía', color: '#ff9800' },
        food: {  name: 'Alimentación', color: '#4caf50' },
        waste: {  name: 'Residuos', color: '#8d6e63' },
        water: {  name: 'Agua', color: '#4fc3f7' }
    };

    const category = categoryInfo[question.category];

    return (
        <div className="questionnaire-container fade-in">
            <div className="questionnaire-header">
                <h1>Calculadora de Huella de Carbono</h1>
                <p>Responde las siguientes preguntas para conocer tu impacto ambiental</p>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="question-counter">
                Pregunta {currentQuestion + 1} de {questionnaire.questions.length}
            </div>

            <div className="question-card card">
                <div className="category-badge" style={{ backgroundColor: category.color }}>
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                </div>

                <h2 className="question-text">{question.question}</h2>

                <div className="options-grid">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option-card ${answers[question.id] === option.value ? 'selected' : ''}`}
                            onClick={() => handleAnswer(question.id, option.value)}
                        >
                            <div className="option-label">{option.label}</div>
                            {answers[question.id] === option.value && (
                                <div className="check-icon">✓</div>
                            )}
                        </button>
                    ))}
                </div>

                {error && <div className="error-message mt-2">{error}</div>}

                <div className="question-navigation">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        ← Anterior
                    </button>

                    {!isLastQuestion ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={!isAnswered}
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting}
                        >
                            {submitting ? <div className="spinner"></div> : 'Ver Resultados'}
                        </button>
                    )}
                </div>
            </div>

            <div className="disclaimer">
                <p><strong>Nota:</strong> {questionnaire.disclaimer}</p>
            </div>
        </div>
    );
}
