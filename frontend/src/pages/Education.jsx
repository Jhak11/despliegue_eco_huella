import { useState, useEffect } from 'react';
import api from '../services/api';
import TopicViewer from '../components/TopicViewer';
import { TOPICS } from '../data/educationContent';
import './Education.css';
import '../components/RewardNotification'; // Reuse styles if needed or separate
import RewardNotification from '../components/RewardNotification';

export default function Education() {
    const [activeTopic, setActiveTopic] = useState(null);
    const [completedTopics, setCompletedTopics] = useState([]);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const { data } = await api.get('/education/progress');
            setCompletedTopics(data.map(p => p.topic_id));
        } catch (error) {
            console.error("Failed to fetch education progress", error);
        }
    };

    const handleCompleteTopic = async (topicId) => {
        try {
            const { data } = await api.post('/education/complete', { topicId });
            setActiveTopic(null);

            if (data.firstTime) {
                setReward({
                    message: "¡Conocimiento adquirido!",
                    xp: 0,
                    coins: data.brotosEarned
                });
                setCompletedTopics(prev => [...prev, topicId]);
            }
        } catch (error) {
            console.error("Error completing topic", error);
        }
    };

    return (
        <div className="dashboard-container education-container fade-in">
            <div className="education-header">
                <h1>Educación Ambiental</h1>
                <p>Aprende conceptos clave de forma rápida y gana Brotos.</p>
            </div>

            <div className="topics-grid">
                {TOPICS.map(topic => {
                    const isCompleted = completedTopics.includes(topic.id);
                    return (
                        <div
                            key={topic.id}
                            className={`topic-card ${isCompleted ? 'completed' : ''}`}
                            onClick={() => setActiveTopic(topic)}
                        >
                            {isCompleted && <span className="completion-badge">✓ Completado</span>}
                            <span className="topic-icon">{topic.icon}</span>
                            <div className="topic-info">
                                <h3>{topic.title}</h3>
                                <p>{topic.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeTopic && (
                <TopicViewer
                    topic={activeTopic}
                    onClose={() => setActiveTopic(null)}
                    onComplete={() => handleCompleteTopic(activeTopic.id)}
                />
            )}

            {reward && (
                <RewardNotification
                    reward={reward}
                    onClose={() => setReward(null)}
                />
            )}
        </div>
    );
}
