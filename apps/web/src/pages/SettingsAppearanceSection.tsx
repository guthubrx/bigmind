import { COLOR_PALETTES, ColorPalette } from '../hooks/useAppSettings';

interface AppearanceSectionProps {
    accentColor: string;
    setAccentColor: (color: string) => void;
    selectedPalette: string;
    setSelectedPalette: (palette: string) => void;
    pastelBg: (alpha: number) => string;
}

export function AppearanceSection({
    accentColor,
    setAccentColor,
    selectedPalette,
    setSelectedPalette,
    pastelBg
}: AppearanceSectionProps) {
    return (
        <div className="settings-section">
            <h2 className="settings-section-title">Apparence</h2>

            {/* Couleur d'accent */}
            <div className="settings-field">
                <label htmlFor="accentColor" className="settings-label">
                    Couleur d&apos;accent
                </label>
                <div className="color-input-container">
                    <input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="color-input"
                    />
                    <span className="color-value">{accentColor}</span>
                </div>
            </div>

            {/* Sélecteur de palette de couleurs */}
            <div className="palette-section">
                <div className="palette-section-title">
                    Palette de couleurs pour les cartes mentales
                </div>
                <div className="palette-grid">
                    {COLOR_PALETTES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((palette: ColorPalette) => (
                        <div
                            key={palette.id}
                            className={`palette-card ${selectedPalette === palette.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPalette(palette.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedPalette(palette.id);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            style={{
                                border: selectedPalette === palette.id ? `2px solid ${accentColor}` : '1px solid #e2e8f0',
                                background: selectedPalette === palette.id ? pastelBg(0.08) : '#ffffff',
                                boxShadow: selectedPalette === palette.id ? `0 4px 12px ${accentColor}20` : '0 2px 4px rgba(0,0,0,0.05)',
                            }}
                        >
                            <div className="palette-header">
                                <h3 className="palette-name">{palette.name}</h3>
                                {selectedPalette === palette.id && (
                                    <div
                                        className="palette-checkmark"
                                        style={{ background: accentColor }}
                                    >
                                        ✓
                                    </div>
                                )}
                            </div>
                            <p className="palette-description">{palette.description}</p>
                            <div className="palette-colors">
                                {palette.colors.map((color, index) => (
                                    <div
                                        key={`${palette.id}-color-${index}`}
                                        className="palette-color"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}























