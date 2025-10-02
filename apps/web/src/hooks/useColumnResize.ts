/**
 * FR: Hook pour gérer le redimensionnement des colonnes par drag & drop
 * EN: Hook to handle column resizing via drag & drop
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppSettings } from './useAppSettings';

export interface ColumnSizes {
  files: number;
  explorer: number;
  properties: number;
}

export interface ColumnSizeLimits {
  min: number;
  max: number;
}

const DEFAULT_COLUMN_SIZES: ColumnSizes = {
  files: 200,
  explorer: 280,
  properties: 300,
};

const COLUMN_SIZE_LIMITS: Record<keyof ColumnSizes, ColumnSizeLimits> = {
  files: { min: 150, max: 400 },
  explorer: { min: 200, max: 500 },
  properties: { min: 200, max: 600 },
};

export const useColumnResize = () => {
  const borderThickness = useAppSettings(s => s.columnBorderThickness);
  const [columnSizes, setColumnSizes] = useState<ColumnSizes>(DEFAULT_COLUMN_SIZES);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; size: number } | null>(null);

  const isResizingRef = useRef(false);

  // Charger les tailles depuis localStorage au montage
  useEffect(() => {
    const savedSizes = localStorage.getItem('bigmind-column-sizes');
    if (savedSizes) {
      try {
        const parsed = JSON.parse(savedSizes);
        // Valider les tailles
        const validatedSizes: ColumnSizes = {
          files: Math.max(
            COLUMN_SIZE_LIMITS.files.min,
            Math.min(COLUMN_SIZE_LIMITS.files.max, parsed.files || DEFAULT_COLUMN_SIZES.files)
          ),
          explorer: Math.max(
            COLUMN_SIZE_LIMITS.explorer.min,
            Math.min(
              COLUMN_SIZE_LIMITS.explorer.max,
              parsed.explorer || DEFAULT_COLUMN_SIZES.explorer
            )
          ),
          properties: Math.max(
            COLUMN_SIZE_LIMITS.properties.min,
            Math.min(
              COLUMN_SIZE_LIMITS.properties.max,
              parsed.properties || DEFAULT_COLUMN_SIZES.properties
            )
          ),
        };
        setColumnSizes(validatedSizes);
      } catch (error) {
        console.warn('Erreur lors du chargement des tailles de colonnes:', error);
      }
    }
  }, []);

  // Sauvegarder les tailles dans localStorage
  const saveColumnSizes = useCallback((sizes: ColumnSizes) => {
    localStorage.setItem('bigmind-column-sizes', JSON.stringify(sizes));
  }, []);

  const startResize = useCallback(
    (columnKey: keyof ColumnSizes, event: React.MouseEvent) => {
      event.preventDefault();
      isResizingRef.current = true;
      setIsDragging(columnKey);
      setDragStart({
        x: event.clientX,
        size: columnSizes[columnKey],
      });
    },
    [columnSizes]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !dragStart) return;

      const deltaX = event.clientX - dragStart.x;

      // Pour les colonnes de droite (properties), inverser la logique de redimensionnement
      const isRightColumn = isDragging === 'properties';
      const adjustment = isRightColumn ? -deltaX : deltaX;

      const newSize = Math.max(
        COLUMN_SIZE_LIMITS[isDragging as keyof ColumnSizes].min,
        Math.min(
          COLUMN_SIZE_LIMITS[isDragging as keyof ColumnSizes].max,
          dragStart.size + adjustment
        )
      );

      setColumnSizes(prev => ({
        ...prev,
        [isDragging]: newSize,
      }));
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      isResizingRef.current = false;
      setIsDragging(null);
      setDragStart(null);
      // Sauvegarder les nouvelles tailles
      saveColumnSizes(columnSizes);
    }
  }, [isDragging, columnSizes, saveColumnSizes]);

  // Gérer les événements globaux de souris
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      return undefined;
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Réinitialiser les tailles par défaut
  const resetColumnSizes = useCallback(() => {
    setColumnSizes(DEFAULT_COLUMN_SIZES);
    saveColumnSizes(DEFAULT_COLUMN_SIZES);
  }, [saveColumnSizes]);

  // Mettre à jour une taille spécifique
  const updateColumnSize = useCallback(
    (columnKey: keyof ColumnSizes, size: number) => {
      const validatedSize = Math.max(
        COLUMN_SIZE_LIMITS[columnKey].min,
        Math.min(COLUMN_SIZE_LIMITS[columnKey].max, size)
      );

      setColumnSizes(prev => ({
        ...prev,
        [columnKey]: validatedSize,
      }));

      // Sauvegarder immédiatement
      const newSizes = {
        ...columnSizes,
        [columnKey]: validatedSize,
      };
      saveColumnSizes(newSizes);
    },
    [columnSizes, saveColumnSizes]
  );

  // Fonction pour obtenir la valeur CSS de l'épaisseur de bordure
  const getBorderThickness = useCallback(() => `${borderThickness}px`, [borderThickness]);

  return {
    columnSizes,
    isDragging,
    startResize,
    resetColumnSizes,
    updateColumnSize,
    COLUMN_SIZE_LIMITS,
    DEFAULT_COLUMN_SIZES,
    borderThickness,
    getBorderThickness,
  };
};
