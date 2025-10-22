/**
 * FR: Galerie de templates pour créer une nouvelle carte
 * EN: Template gallery for creating a new mind map
 */

import React, { useMemo, useState } from 'react';
import { Template, TemplateCategory, TemplateComplexity, MindMap } from '@bigmind/core';
import { PRESET_TEMPLATES } from '@bigmind/design';
import { useTemplates } from '../hooks/useTemplates';
import { Star, Download, Upload, Trash2, ChevronDown, Search, X } from 'lucide-react';

interface TemplateGalleryProps {
  onTemplateSelect?: (mindMap: MindMap) => void;
}

export function TemplateGallery({ onTemplateSelect }: TemplateGalleryProps) {
  const {
    allTemplates,
    favoriteTemplates,
    recentTemplates,
    favoriteTemplateIds,
    customTemplates,
    toggleFavorite,
    deleteCustomTemplate,
    createMindMapFromTemplate,
    exportTemplate,
    importTemplate,
  } = useTemplates();

  const [view, setView] = useState<'all' | 'favorites' | 'recent' | 'custom'>('all');
  const [expandedCategory, setExpandedCategory] = useState<TemplateCategory | null>(null);
  const [expandedComplexity, setExpandedComplexity] = useState<TemplateComplexity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // FR: Filtrer les templates
  // EN: Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    // FR: Filtrer par vue
    // EN: Filter by view
    if (view === 'favorites') {
      templates = favoriteTemplates;
    } else if (view === 'recent') {
      templates = recentTemplates;
    } else if (view === 'custom') {
      templates = customTemplates;
    }

    // FR: Filtrer par recherche
    // EN: Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.metadata.name.toLowerCase().includes(q) ||
          t.metadata.description.toLowerCase().includes(q)
      );
    }

    return templates;
  }, [
    allTemplates,
    view,
    searchQuery,
    favoriteTemplates,
    recentTemplates,
    customTemplates,
  ]);

  // FR: Grouper par catégorie/complexité
  // EN: Group by category/complexity
  const groupedTemplates = useMemo(() => {
    const grouped = new Map<TemplateCategory, Template[]>();

    filteredTemplates.forEach((template) => {
      const key = template.metadata.category;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(template);
    });

    return grouped;
  }, [filteredTemplates]);

  const handleCreateFromTemplate = (template: Template, customName?: string) => {
    const mindMap = createMindMapFromTemplate(template.metadata.id, customName);
    if (mindMap) {
      onTemplateSelect?.(mindMap);
    }
  };

  const handleExport = (templateId: string) => {
    const json = exportTemplate(templateId);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${templateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const template = importTemplate(text);
      if (template) {
        setImportError(null);
        handleCreateFromTemplate(template);
      } else {
        setImportError('Format de fichier invalide');
      }
    } catch (error) {
      setImportError('Erreur lors de l\'import du template');
    }
  };

  const TemplateCard = ({ template }: { template: Template }) => {
    const isFavorite = favoriteTemplateIds.includes(template.metadata.id);
    const isCustom = !template.metadata.isSystem;

    return (
      <div className="flex flex-col p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-all h-full">
        {/* FR: En-tête avec titre et actions / EN: Header with title and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{template.metadata.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {template.metadata.category}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {template.metadata.complexity}
              </span>
            </div>
          </div>
        </div>

        {/* FR: Description / EN: Description */}
        <p className="text-xs text-gray-600 mb-3 flex-1">
          {template.metadata.description}
        </p>

        {/* FR: Métadonnées / EN: Metadata */}
        <div className="text-xs text-gray-500 mb-3">
          {template.metadata.author && <p>Par {template.metadata.author}</p>}
          {template.metadata.usageCount && (
            <p>Utilisé {template.metadata.usageCount} fois</p>
          )}
        </div>

        {/* FR: Actions / EN: Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t">
          <button
            onClick={() => handleCreateFromTemplate(template)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition"
          >
            Utiliser
          </button>
          <button
            onClick={() => toggleFavorite(template.metadata.id)}
            className={`p-2 rounded transition ${
              isFavorite
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {isCustom && (
            <>
              <button
                onClick={() => handleExport(template.metadata.id)}
                className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                title="Exporter"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => deleteCustomTemplate(template.metadata.id)}
                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* FR: En-tête avec actions / EN: Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Templates</h2>
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition text-sm font-medium">
          <Upload size={16} />
          Importer
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* FR: Messages d'erreur / EN: Error messages */}
      {importError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center justify-between">
          <span>{importError}</span>
          <button onClick={() => setImportError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* FR: Barre de recherche / EN: Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Chercher un template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* FR: Onglets de vues / EN: View tabs */}
      <div className="flex gap-2 border-b flex-wrap">
        {[
          { id: 'all', label: `Tous (${allTemplates.length})` },
          { id: 'recent', label: `Récents (${recentTemplates.length})` },
          { id: 'favorites', label: `Favoris (${favoriteTemplates.length})` },
          { id: 'custom', label: `Personnalisés (${customTemplates.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as typeof view)}
            className={`px-4 py-2 font-medium text-sm transition ${
              view === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FR: Contenu / EN: Content */}
      {filteredTemplates.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg font-medium">Aucun template trouvé</p>
          <p className="text-sm mt-2">
            {searchQuery
              ? `Essayez une autre recherche`
              : 'Commencez avec un des templates proposés'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedTemplates.entries()).map(([category, templates]) => (
            <div key={category}>
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category
                  )
                }
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded font-semibold text-sm mb-2"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedCategory === category ? 'rotate-180' : ''
                  }`}
                />
                {category} ({templates.length})
              </button>

              {expandedCategory === category && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <TemplateCard key={template.metadata.id} template={template} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FR: Info sur les templates / EN: Templates info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Astuce</p>
        <p>
          Utilisez les templates pour démarrer rapidement. Vous pouvez aussi créer vos
          propres templates à partir de vos cartes existantes.
        </p>
      </div>
    </div>
  );
}
