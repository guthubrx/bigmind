
interface InteractionSectionProps {
    dragTolerance: number;
    setDragTolerance: (value: number) => void;
    accentColor: string;
    pastelBg: (alpha: number) => string;
}

export function InteractionSection({
    dragTolerance,
    setDragTolerance,
    accentColor,
    pastelBg
}: InteractionSectionProps) {
    return (
        <div className="settings-section">
            <h2 className="settings-section-title">Interaction</h2>

            {/* Paramètre de tolérance de drag and drop */}
            <div className="settings-field">
                <label htmlFor="dragTolerance" className="settings-label">
                    Tolérance de glisser-déposer
                </label>
                <div className="range-input-container">
                    <input
                        id="dragTolerance"
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={dragTolerance}
                        onChange={(e) => setDragTolerance(parseInt(e.target.value, 10))}
                        className="range-input"
                    />
                    <div className="range-value">
                        <span className="range-value-text" style={{ color: accentColor }}>
                            {dragTolerance}px
                        </span>
                    </div>
                </div>
                <p className="settings-description">
                    Zone de tolérance autour des nœuds pour faciliter le glisser-déposer.
                    Une valeur plus élevée rend le dépôt plus facile mais moins précis.
                </p>

                {/* Indicateur visuel de la tolérance */}
                <div className="tolerance-preview">
                    <div className="preview-label">Aperçu :</div>
                    <div className="preview-container">
                        <div className="preview-node">Nœud cible</div>
                        <div
                            className="preview-tolerance"
                            style={{
                                top: -dragTolerance,
                                left: -dragTolerance,
                                right: -dragTolerance,
                                bottom: -dragTolerance,
                                border: `2px dashed ${accentColor}`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}























