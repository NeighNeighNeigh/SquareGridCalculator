import { calculateGrids } from './calculator.js';
import { displayResults } from './renderer.js';
import { 
    initTheme, 
    initializeInputHandlers, 
    getReasons, 
    getSettings,
    initModal
} from './ui.js';

// Initialize theme
function initializeTheme() {
    initTheme();
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initModal();

    // Initialize input handlers
    initializeInputHandlers();

    // Generate button click handler
    document.getElementById('generate').addEventListener('click', () => {
        const settings = getSettings();
        
        const results = calculateGrids(settings.width, settings.height, settings, () => {
            const reasons = getReasons(settings);
            return confirm(
                '100+ grid combinations found.\n\n' +
                (reasons.length ? 'Possible reasons:\n• ' + reasons.join('\n• ') + '\n\n' : '') +
                'Click "OK" to find all\n' +
                'Click "Cancel" to show current results'
            );
        });
        
        displayResults(results, settings.width, settings.height);
    });
});
