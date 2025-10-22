import React from 'react';
import { ShortcutAction, useShortcuts } from '../hooks/useShortcuts';
import { toAccelerator } from '../utils/shortcutUtils';

interface ShortcutsSectionProps {
    pastelBg: (alpha: number) => string;
}

export function ShortcutsSection({ pastelBg }: ShortcutsSectionProps) {
    const shortcuts = useShortcuts((s) => s.map);
    const setShortcut = useShortcuts((s) => s.setShortcut);
    const resetShortcuts = useShortcuts((s) => s.resetDefaults);

    // Grouper les raccourcis par catégorie
    const groups: Record<string, Array<[string, string]>> = {};
    Object.entries(shortcuts).forEach(([action, acc]) => {
        const cat = action.split('.')[0] || 'autres';
        (groups[cat] = groups[cat] || []).push([action, acc]);
    });

    const categoryOrder = ['file', 'edit', 'view', 'insert', 'tools', 'autres'];

    return (
        <div>
            <h2 className="settings-section-title">Raccourcis clavier</h2>

            {categoryOrder
                .filter((cat) => groups[cat] && groups[cat].length)
                .map((cat) => (
                    <div key={cat} className="shortcut-category">
                        <div className="shortcut-category-title">{cat}</div>
                        <div className="shortcut-grid">
                            {groups[cat].map(([action, acc]) => {
                                const inputId = `shortcut-${action}`;
                                return (
                                    <React.Fragment key={action}>
                                        <label htmlFor={inputId} className="shortcut-label">
                                            {action.split('.')[1] || action}
                                        </label>
                                        <input
                                            id={inputId}
                                            type="text"
                                            value={acc}
                                            onChange={(e) => setShortcut(action as ShortcutAction, e.target.value)}
                                            onKeyDown={(e) => {
                                                e.preventDefault();
                                                const accel = toAccelerator(e);
                                                if (accel) setShortcut(action as ShortcutAction, accel);
                                            }}
                                            className="shortcut-input"
                                            placeholder="Appuyez sur une combinaison…"
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                ))}

            <div className="shortcut-actions">
                <button type="button" className="btn" onClick={resetShortcuts}>
                    Réinitialiser par défaut
                </button>
            </div>
        </div>
    );
}























