import { useState, useEffect } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { storageService } from '../services/storageService';

export function useAppInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);
    const addJournalEntry = useGraphStore((state) => state.addJournalEntry);

    useEffect(() => {
        const initialize = async () => {
            // Initialize storage
            await storageService.initialize();

            // Try to load the last session
            const session = await storageService.getLatestSession();
            if (session) {
                useGraphStore.getState().loadSession(session);
                addJournalEntry({
                    type: 'milestone',
                    message: 'Loaded previous session',
                });
            }

            // Add welcome journal entry
            addJournalEntry({
                type: 'milestone',
                message: 'Welcome to Storylines - AI-Powered Literary Exploration',
            });

            addJournalEntry({
                type: 'info',
                message: 'Search for books, authors, or themes to begin exploring',
            });

            setIsInitialized(true);
        };

        initialize();
    }, [addJournalEntry]);

    return { isInitialized };
}
