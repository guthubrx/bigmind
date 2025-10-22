/**
 * FR: Sélecteur de thème avec aperçu
 * EN: Theme selector with preview
 */

import React, { useMemo, useState } from 'react';
import { Theme, ThemeCategory } from '@bigmind/core';
import { PRESET_THEMES } from '@bigmind/design';
import { useThemes } from '../hooks/useThemes';
import { Star, Download, Upload, Plus, Trash2, ChevronDown } from 'lucide-react';

interface ThemeSelectorProps {
  onThemeSelect?: (theme: Theme) => void;
}

export function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
  const {
    activeThemeId,
    allThemes,
    favoriteThemes,
    setActiveTheme,
    toggleFavorite,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
  } = useThemes();

  const [expandedCategory, setExpandedCategory] = useState<ThemeCategory | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // FR: Grouper les thèmes par catégorie
  // EN: Group themes by category
  const categorizedThemes = useMemo(() => {
    const grouped = new Map<ThemeCategory, Theme[]>();
    PRESET_THEMES.forEach((theme) => {
      const key = theme.category;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(theme);
    });
    return grouped;
  }, []);

  const handleSelectTheme = (theme: Theme) => {
    setActiveTheme(theme.id);
    onThemeSelect?.(theme);
  };

  const handleExport = (themeId: string) => {
    const json = exportTheme(themeId);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const theme = importTheme(text);
      if (theme) {
        setActiveTheme(theme.id);
        setImportError(null);
      } else {
        setImportError('Format de fichier invalide');
      }
    } catch (error) {
      setImportError('Erreur lors de l\'import du thème');
    }
  };

  const handleCreateFromActive = () => {
    const activeTheme = allThemes.find((t) => t.id === activeThemeId);
    if (!activeTheme) return;

    const customTheme = createCustomTheme(`${activeTheme.name} (copie)`, {
      description: `Copie personnalisée de ${activeTheme.name}`,
    });
    setActiveTheme(customTheme.id);
  };

  const ThemeCard = ({ theme, isFavorite }: { theme: Theme; isFavorite: boolean }) => (
    <div
      onClick={() => handleSelectTheme(theme)}
      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
        activeThemeId === theme.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
      } hover:shadow-md`}
    >
      {/* FR: Aperçu des couleurs / EN: Colors preview */}
      <div className="flex gap-1 mb-2 h-6 rounded overflow-hidden">
        {[
          theme.colors.primary,
          theme.colors.secondary || theme.colors.primary,
          ...theme.colors.branchColors.slice(0, 3),
        ].map((color, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* FR: Nom et catégorie / EN: Name and category */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{theme.name}</h3>
          <p className="text-xs text-gray-500 truncate">{theme.description}</p>
        </div>
        {!theme.isSystem && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCustomTheme(theme.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
            title="Supprimer"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        )}
      </div>

      {/* FR: Bouton favori / EN: Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(theme.id);
        }}
        className="mt-2 p-1 hover:bg-gray-100 rounded"
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Star
          size={16}
          className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* FR: En-tête avec actions / EN: Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Thèmes</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCreateFromActive}
            className="p-2 hover:bg-gray-100 rounded text-sm flex items-center gap-1"
            title="Créer un thème personnalisé"
          >
            <Plus size={16} />
            Nouveau
          </button>
          <label className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm flex items-center gap-1">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* FR: Messages d'erreur / EN: Error messages */}
      {importError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {importError}
        </div>
      )}

      {/* FR: Onglets / EN: Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setShowCustom(false)}
          className={`px-4 py-2 font-medium text-sm ${
            !showCustom ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
          }`}
        >
          Système ({PRESET_THEMES.length})
        </button>
        {/* FR: Onglet personnalisés si existants / EN: Custom tab if exists */}
        {allThemes.some((t) => !t.isSystem) && (
          <button
            onClick={() => setShowCustom(true)}
            className={`px-4 py-2 font-medium text-sm ${
              showCustom ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            Personnalisés ({allThemes.filter((t) => !t.isSystem).length})
          </button>
        )}
      </div>

      {/* FR: Grille de thèmes / EN: Themes grid */}
      {!showCustom ? (
        <div className="space-y-4">
          {Array.from(categorizedThemes.entries()).map(([category, themes]) => (
            <div key={category}>
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category
                  )
                }
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded font-semibold text-sm"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedCategory === category ? 'rotate-180' : ''
                  }`}
                />
                {category}
              </button>

              {expandedCategory === category && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
                  {themes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isFavorite={favoriteThemes.some((t) => t.id === theme.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allThemes
            .filter((t) => !t.isSystem)
            .map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isFavorite={favoriteThemes.some((t) => t.id === theme.id)}
              />
            ))}
        </div>
      )}

      {/* FR: Favoris visibles / EN: Visible favorites */}
      {favoriteThemes.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold text-sm mb-3">Favoris ({favoriteThemes.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {favoriteThemes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} isFavorite={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
