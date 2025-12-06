import { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { useGraphStore } from '../store/useGraphStore';

export function useGemini() {
    const [showApiPrompt, setShowApiPrompt] = useState(false);
    const [geminiKey, setGeminiKey] = useState('');
    const addJournalEntry = useGraphStore((state) => state.addJournalEntry);

    const handleSetupGemini = () => {
        if (geminiKey.trim()) {
            geminiService.initialize(geminiKey);
            setShowApiPrompt(false);
            addJournalEntry({
                type: 'technical',
                message: 'Gemini AI initialized - AI insights enabled',
            });
        }
    };

    const isGeminiInitialized = geminiService.isInitialized();

    return {
        showApiPrompt,
        setShowApiPrompt,
        geminiKey,
        setGeminiKey,
        handleSetupGemini,
        isGeminiInitialized,
    };
}
