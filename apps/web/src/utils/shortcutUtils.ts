/**
 * Utilitaires pour la gestion des raccourcis clavier
 */

/**
 * Convertit un événement clavier en chaîne d'accélérateur
 * @param e - Événement clavier
 * @param isMac - Indique si on est sur Mac
 * @returns Chaîne d'accélérateur (ex: "Ctrl+Shift+A")
 */
export function toAccelerator(e: React.KeyboardEvent<HTMLInputElement>, isMac: boolean = false): string {
    const parts: string[] = [];

    // Modificateurs
    if (e.ctrlKey || e.metaKey) parts.push(isMac ? 'Cmd' : 'Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');

    // Touche principale
    const key = e.key;
    if (key && !['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        let main = key;

        // Normaliser certaines touches spéciales
        if (key === '+') main = 'Plus';
        if (key.length === 1) main = key.toUpperCase();
        else if (key === ' ') main = 'Space';

        parts.push(main);
    }

    return parts.join('+');
}

/**
 * Parse une chaîne d'accélérateur en objet de configuration
 * @param accelerator - Chaîne d'accélérateur (ex: "Ctrl+Shift+A")
 * @returns Objet avec les modificateurs et la touche
 */
export function parseAccelerator(accelerator: string): {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    key: string;
} {
    const parts = accelerator.split('+');
    return {
        ctrl: parts.includes('Ctrl') || parts.includes('Cmd'),
        shift: parts.includes('Shift'),
        alt: parts.includes('Alt'),
        key: parts[parts.length - 1] || '',
    };
}

/**
 * Formate un raccourci pour l'affichage
 * @param accelerator - Chaîne d'accélérateur
 * @param isMac - Indique si on est sur Mac
 * @returns Chaîne formatée pour l'affichage
 */
export function formatShortcut(accelerator: string, isMac: boolean = false): string {
    if (isMac) {
        return accelerator
            .replace('Ctrl', '⌘')
            .replace('Shift', '⇧')
            .replace('Alt', '⌥');
    }
    return accelerator;
}























