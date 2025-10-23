/**
 * FR: Dialogue pour insérer un sticker
 * EN: Dialog for inserting a sticker
 */

import React from 'react';
import { StickerAsset } from '@bigmind/core';
import { StickerPicker } from '../StickerPicker';
import { X } from 'lucide-react';

interface InsertStickerDialogProps {
  mapId: string;
  selectedNodeId?: string;
  onClose: () => void;
  onStickerInsert?: (sticker: StickerAsset) => void;
}

export function InsertStickerDialog({
  mapId,
  selectedNodeId,
  onClose,
  onStickerInsert,
}: InsertStickerDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* FR: En-tête / EN: Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">Ajouter un sticker</h2>
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
          <StickerPicker
            mapId={mapId}
            selectedNodeId={selectedNodeId}
            onStickerSelect={sticker => {
              onStickerInsert?.(sticker);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
