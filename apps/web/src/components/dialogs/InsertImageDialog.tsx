/**
 * FR: Dialogue pour insérer une image
 * EN: Dialog for inserting an image
 */

import React from 'react';
import { ImageAsset } from '@bigmind/core';
import { ImageManager } from '../ImageManager';
import { X } from 'lucide-react';

interface InsertImageDialogProps {
  mapId: string;
  onClose: () => void;
  onImageInsert?: (image: ImageAsset) => void;
}

export function InsertImageDialog({ mapId, onClose, onImageInsert }: InsertImageDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* FR: En-tête / EN: Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">Insérer une image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* FR: Contenu / EN: Content */}
        <div className="flex-1 overflow-auto p-4">
          <ImageManager
            mapId={mapId}
            onImageSelect={image => {
              onImageInsert?.(image);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
