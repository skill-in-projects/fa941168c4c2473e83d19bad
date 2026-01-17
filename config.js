// 1. Define Configuration First
// API Configuration
// Backend service URL (automatically configured)
const CONFIG = {
    API_URL: "https://webapifa941168c4c2473e83d19bad-production.up.railway.app"
};

// Ensure CONFIG is globally accessible
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// 2. Mentor Tracking Logic
// --- MENTOR TRACKING START ---
(function() {
    // Extract boardId from API_URL pattern: https://webapi{boardId}.railway.app (no hyphen)
    function getBoardId() {
        // Try to extract from CONFIG.API_URL pattern: https://webapi{boardId}.railway.app
        // Fixed Regex: Removed the hyphen after 'webapi' to match actual Railway URL pattern
        const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG?.API_URL) ? CONFIG.API_URL : '';
        const match = apiUrl.match(/webapi([a-f0-9]{24})/i);
        if (match && match[1]) {
            return match[1];
        }
        
        // Fallback: try to get from current page URL or other source
        // If still not found, will skip logging
        return null;
    }
    
    // Get Mentor API base URL (StrAppers backend) for error logging
    function getMentorApiBaseUrl() {
        // Use configured Mentor API URL if available, otherwise fallback to current origin
        return "https://dev.skill-in.com";
    }
    
    // Log successful page load (fires after page is fully loaded)
    window.addEventListener('load', function() {
        const boardId = getBoardId();
        if (!boardId) {
            console.warn('Mentor tracking: BoardId not found, skipping success log');
            return;
        }
        
        const mentorApiBaseUrl = getMentorApiBaseUrl();
        const frontendLogEndpoint = mentorApiBaseUrl + '/api/Mentor/runtime-error-frontend';
        
        fetch(frontendLogEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boardId: boardId,
                type: 'FRONTEND_SUCCESS',
                timestamp: new Date().toISOString(),
                message: 'Frontend page loaded successfully'
            })
        }).catch(err => console.warn("Mentor success log failed", err));
    });
    
    // Catch JavaScript errors
    window.onerror = function(message, source, lineno, colno, error) {
        const boardId = getBoardId();
        if (!boardId) {
            console.warn('Mentor tracking: BoardId not found, skipping error log');
            return false;
        }
        
        const mentorApiBaseUrl = getMentorApiBaseUrl();
        const frontendLogEndpoint = mentorApiBaseUrl + '/api/Mentor/runtime-error-frontend';
        
        const payload = {
            boardId: boardId,
            type: 'FRONTEND_RUNTIME',
            message: message || 'Unknown error',
            file: source || 'Unknown',
            line: lineno || null,
            column: colno || null,
            stack: error ? error.stack : 'N/A',
            timestamp: new Date().toISOString()
        };

        fetch(frontendLogEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.warn("Mentor error log failed", err));

        return false; // Allows the error to still appear in the browser console
    };

    // Catch unhandled promise rejections (failed API calls)
    window.onunhandledrejection = function(event) {
        const boardId = getBoardId();
        if (!boardId) {
            console.warn('Mentor tracking: BoardId not found, skipping promise rejection log');
            return;
        }
        
        const mentorApiBaseUrl = getMentorApiBaseUrl();
        const frontendLogEndpoint = mentorApiBaseUrl + '/api/Mentor/runtime-error-frontend';
        
        const payload = {
            boardId: boardId,
            type: 'FRONTEND_PROMISE_REJECTION',
            message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
            stack: event.reason?.stack || 'N/A',
            timestamp: new Date().toISOString()
        };

        fetch(frontendLogEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.warn("Mentor promise rejection log failed", err));
    };
})();
// --- MENTOR TRACKING END ---
