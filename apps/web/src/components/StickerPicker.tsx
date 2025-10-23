/**
 * FR: Sélecteur de stickers pour les nœuds
 * EN: Sticker picker for nodes
 */

import React, { useMemo, useState } from 'react';
import { StickerAsset, StickerCategory } from '@bigmind/core';
import {
  ALL_STICKERS,
  getStickersByCategory,
  searchStickersByTag,
  getCustomizableStickers,
} from '@bigmind/design';
import { useAssets } from '../hooks/useAssets';
import { Search, ChevronDown, Plus, X } from 'lucide-react';

interface StickerPickerProps {
  mapId: string;
  selectedNodeId?: string;
  onStickerSelect?: (sticker: StickerAsset) => void;
}

export function StickerPicker({ mapId, selectedNodeId, onStickerSelect }: StickerPickerProps) {
  const { addSticker, customStickers } = useAssets(mapId);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<StickerCategory | null>(null);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  // FR: Filtrer les stickers selon la recherche
  // EN: Filter stickers by search
  const filteredStickers = useMemo(() => {
    if (!searchQuery) return ALL_STICKERS;

    const query = searchQuery.toLowerCase();
    const results = searchStickersByTag(searchQuery);

    // FR: Chercher aussi dans les noms et descriptions
    // EN: Also search in names
    return results.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // FR: Grouper par catégorie
  // EN: Group by category
  const categorizedStickers = useMemo(() => {
    const grouped = new Map<StickerCategory, StickerAsset[]>();

    filteredStickers.forEach(sticker => {
      const key = sticker.category;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(sticker);
    });

    return grouped;
  }, [filteredStickers]);

  const handleSelectSticker = (sticker: StickerAsset) => {
    addSticker(sticker.id);
    onStickerSelect?.(sticker);
  };

  const handleApplyCustomColor = (sticker: StickerAsset) => {
    if (sticker.customizable) {
      onStickerSelect?.({
        ...sticker,
        defaultColor: selectedColor,
      });
    }
  };

  // FR: Couleurs prédéfinies
  // EN: Predefined colors
  const colorPresets = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
  ];

  function StickerCard({ sticker }: { sticker: StickerAsset }) {
    return (
      <div
        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => handleSelectSticker(sticker)}
      >
        {/* FR: Icône / EN: Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition"
          style={{ backgroundColor: sticker.defaultColor }}
        >
          {sticker.iconType === 'emoji' ? sticker.icon : '●'}
        </div>

        {/* FR: Nom / EN: Name */}
        <span className="text-xs font-medium text-center text-gray-700">{sticker.name}</span>

        {/* FR: Badge personnalisable / EN: Customizable badge */}
        {sticker.customizable && (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            Personnalisable
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* FR: En-tête / EN: Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Stickers</h2>
        {selectedNodeId && (
          <button
            onClick={() => setCustomizationMode(!customizationMode)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              customizationMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {customizationMode ? 'Fermer' : 'Personnaliser'}
          </button>
        )}
      </div>

      {/* FR: Barre de recherche / EN: Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Chercher par tag..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* FR: Mode personnalisation / EN: Customization mode */}
      {customizationMode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <h3 className="font-semibold text-sm">Personnaliser les couleurs</h3>
          <div className="grid grid-cols-5 gap-2">
            {colorPresets.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg transition-all border-2 ${
                  selectedColor === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      )}

      {/* FR: Grille de stickers / EN: Stickers grid */}
      {filteredStickers.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">Aucun sticker trouvé pour "{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(categorizedStickers.entries()).map(([category, stickers]) => (
            <div key={category}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded font-semibold text-sm"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedCategory === category ? 'rotate-180' : ''
                  }`}
                />
                {category} ({stickers.length})
              </button>

              {expandedCategory === category && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
                  {stickers.map(sticker => (
                    <StickerCard key={sticker.id} sticker={sticker} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FR: Stickers personnalisés / EN: Custom stickers */}
      {customStickers.length > 0 && (
        <div className="pt-4 border-t">
          <h3 className="font-semibold text-sm mb-3">Mes stickers ({customStickers.length})</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {customStickers.map(sticker => (
              <StickerCard key={sticker.id} sticker={sticker} />
            ))}
          </div>
        </div>
      )}

      {/* FR: Info sur stickers personnalisables / EN: Customizable stickers info */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
        <p className="font-medium mb-1">💡 Astuce</p>
        <p>
          {getCustomizableStickers().length} stickers peuvent être personnalisés en couleur. Activez
          le mode "Personnaliser" pour changer leur couleur.
        </p>
      </div>
    </div>
  );
}
