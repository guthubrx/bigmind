/**
 * FR: Composant de paramètres pour les tailles de colonnes
 * EN: Column size settings component
 */

import React from 'react';
import { ColumnSizes, ColumnSizeLimits } from '../hooks/useColumnResize';

function ColumnSizeSettings({
  columnSizes,
  onSizeChange,
  onReset,
  sizeLimits,
  accentColor = '#3b82f6',
  borderThickness,
  onBorderThicknessChange,
}: {
  columnSizes: ColumnSizes;
  onSizeChange: (columnKey: keyof ColumnSizes, size: number) => void;
  onReset: () => void;
  sizeLimits: Record<keyof ColumnSizes, ColumnSizeLimits>;
  accentColor?: string;
  borderThickness: number;
  onBorderThicknessChange: (thickness: number) => void;
}) {
  const pastelBg = (alpha: number = 0.06) => {
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 59;
    const g = parseInt(hex.substring(2, 4), 16) || 130;
    const b = parseInt(hex.substring(4, 6), 16) || 246;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const columns = [
    {
      key: 'files' as const,
      label: 'Colonne Fichiers',
      description: 'Largeur de la colonne des fichiers ouverts',
    },
    {
      key: 'explorer' as const,
      label: 'Colonne Explorateur',
      description: "Largeur de la colonne de l'explorateur de nœuds",
    },
    {
      key: 'properties' as const,
      label: 'Colonne Propriétés',
      description: 'Largeur de la colonne des propriétés du nœud',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        maxWidth: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        background: pastelBg(0.03),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Tailles des Colonnes</h2>
        <button
          type="button"
          className="btn"
          onClick={onReset}
          style={{
            fontSize: 12,
            padding: '6px 12px',
            background: pastelBg(0.1),
            borderColor: accentColor,
          }}
        >
          Réinitialiser
        </button>
      </div>

      <p
        style={{
          fontSize: 13,
          color: '#6b7280',
          margin: '0 0 16px 0',
          lineHeight: 1.4,
        }}
      >
        Ajustez la largeur des colonnes de l&apos;interface. Vous pouvez aussi redimensionner les
        colonnes directement dans l&apos;interface principale par glisser-déposer.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        {columns.map(column => (
          <div
            key={column.key}
            style={{
              display: 'grid',
              gap: 8,
              padding: 12,
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                htmlFor={`column-size-${column.key}`}
                style={{ fontWeight: 500, color: '#374151' }}
              >
                {column.label}
              </label>
              <span
                style={{
                  fontSize: 12,
                  color: accentColor,
                  fontWeight: 600,
                  background: pastelBg(0.1),
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {columnSizes[column.key]}px
              </span>
            </div>

            <p
              style={{
                fontSize: 12,
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {column.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id={`column-size-${column.key}`}
                type="range"
                min={sizeLimits[column.key].min}
                max={sizeLimits[column.key].max}
                step={10}
                value={columnSizes[column.key]}
                onChange={e => onSizeChange(column.key, parseInt(e.target.value, 10))}
                style={{
                  flex: 1,
                  maxWidth: 300,
                  accentColor,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 120,
                }}
              >
                <input
                  type="number"
                  value={columnSizes[column.key]}
                  onChange={e =>
                    onSizeChange(
                      column.key,
                      parseInt(e.target.value, 10) || sizeLimits[column.key].min
                    )
                  }
                  min={sizeLimits[column.key].min}
                  max={sizeLimits[column.key].max}
                  step={10}
                  style={{
                    width: 70,
                    fontSize: 12,
                    padding: '4px 6px',
                    border: `1px solid ${accentColor}`,
                    borderRadius: 4,
                    textAlign: 'center',
                  }}
                />
                <span style={{ fontSize: 11, color: '#6b7280' }}>px</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                color: '#9ca3af',
              }}
            >
              <span>Min: {sizeLimits[column.key].min}px</span>
              <span>Max: {sizeLimits[column.key].max}px</span>
            </div>
          </div>
        ))}
      </div>

      {/* FR: Section Épaisseur des bordures */}
      {/* EN: Border Thickness Section */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#374151' }}>
            Épaisseur des bordures
          </h3>
          <span
            style={{
              fontSize: 11,
              color: accentColor,
              fontWeight: 600,
              background: pastelBg(0.1),
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {borderThickness}px
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color: '#6b7280',
            margin: '0 0 12px 0',
            lineHeight: 1.3,
          }}
        >
          Ajustez la finesse des bordures visibles lors du redimensionnement des colonnes.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            id="border-thickness"
            type="range"
            min={1}
            max={3}
            step={0.5}
            value={borderThickness}
            onChange={e => onBorderThicknessChange(parseFloat(e.target.value))}
            style={{
              flex: 1,
              maxWidth: 200,
              accentColor,
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 80,
            }}
          >
            <input
              type="number"
              value={borderThickness}
              onChange={e => {
                const value = parseFloat(e.target.value);
                if (!Number.isNaN(value) && value >= 1 && value <= 3) {
                  onBorderThicknessChange(value);
                }
              }}
              min={1}
              max={3}
              step={0.5}
              style={{
                width: 60,
                fontSize: 12,
                padding: '4px 6px',
                border: `1px solid ${accentColor}`,
                borderRadius: 4,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 11, color: '#6b7280' }}>px</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 8,
            fontSize: 11,
            color: '#9ca3af',
          }}
        >
          <span>Min: 1px</span>
          <span>Max: 3px</span>
          <span>•</span>
          <span>Étape: 0.5px</span>
        </div>

        {/* FR: Aperçu visuel de l'épaisseur */}
        {/* EN: Visual thickness preview */}
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Aperçu :</div>
          <div
            style={{
              height: 40,
              background: '#ffffff',
              border: `${borderThickness}px solid ${accentColor}`,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: accentColor,
              fontWeight: 500,
            }}
          >
            Bordure de {borderThickness}px
          </div>
        </div>
      </div>
    </div>
  );
}

export { ColumnSizeSettings };
export default ColumnSizeSettings;
