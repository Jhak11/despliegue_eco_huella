import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RewardNotification.css';

export default function RewardNotification({ reward, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!reward) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="reward-notification"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
            >
                <div className="reward-content">
                    <span className="reward-icon">🎉</span>
                    <div className="reward-text">
                        <h4>{reward.message}</h4>
                        <div className="reward-values">
                            {reward.xp > 0 && <span className="xp-tag">+{reward.xp} XP</span>}
                            {reward.coins > 0 && <span className="brotos-tag">+{reward.coins} Brotos</span>}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
