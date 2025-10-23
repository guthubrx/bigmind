/**
 * FR: Gestionnaire d'images pour la carte mentale
 * EN: Image manager for mind map
 */

import React, { useRef, useState } from 'react';
import { ImageAsset, AssetUtils } from '@bigmind/core';
import { useAssets } from '../hooks/useAssets';
import { Upload, Trash2, Copy, Download, AlertCircle, Eye, X } from 'lucide-react';

interface ImageManagerProps {
  mapId: string;
  onImageSelect?: (image: ImageAsset) => void;
}

export function ImageManager({ mapId, onImageSelect }: ImageManagerProps) {
  const { images, uploadImage, removeImage, availableSpace, usagePercentage } = useAssets(mapId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<ImageAsset | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;

    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        console.log(`🚀 Début de l'upload: ${file.name} (${file.size} bytes)`);

        // FR: Valider la taille
        // EN: Validate file size
        if (file.size > availableSpace) {
          setUploadError(`Espace insuffisant pour ${file.name}`);
          console.error(`❌ Espace insuffisant: ${file.size} > ${availableSpace}`);
          continue;
        }

        // FR: Valider le type
        // EN: Validate file type
        if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
          setUploadError(`Format non supporté: ${file.name}`);
          console.error(`❌ Format non supporté: ${file.type}`);
          continue;
        }

        // FR: Démarrer l'upload avec animation progressive
        // EN: Start upload with progressive animation
        setCurrentFileName(file.name);
        setUploading(true);
        setUploadProgress(0);

        // FR: Simuler une progression fluide comme Gmail
        // EN: Simulate smooth progress like Gmail
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const image = await uploadImage(file);

        clearInterval(progressInterval);

        if (image) {
          console.log(`✅ Image uploadée: ${image.id}`);
          setUploadProgress(100);
          onImageSelect?.(image);

          // FR: Attendre un peu pour montrer 100% puis masquer
          // EN: Wait a bit to show 100% then hide
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
            setCurrentFileName('');
          }, 500);
        } else {
          console.error(`❌ Échec de l'upload: image est null`);
          setUploadError(`Échec de l'upload pour ${file.name}`);
          setUploading(false);
          setUploadProgress(0);
          setCurrentFileName('');
        }
      } catch (error) {
        console.error(`❌ Erreur lors du chargement de ${file.name}:`, error);
        setUploadError(`Erreur lors du chargement de ${file.name}`);
        setUploading(false);
        setUploadProgress(0);
        setCurrentFileName('');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (image: ImageAsset) => {
    const a = document.createElement('a');
    a.href = image.data;
    a.download = image.fileName;
    a.click();
  };

  const handleCopyDataUrl = (image: ImageAsset) => {
    navigator.clipboard.writeText(image.data);
    setCopiedId(image.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* FR: En-tête / EN: Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Images</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || availableSpace === 0}
          className="btn flex items-center justify-center p-2 rounded-full disabled:opacity-50"
          title="Ajouter des images"
        >
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* FR: Messages d'erreur / EN: Error messages */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle size={16} />
          {uploadError}
        </div>
      )}

      {/* FR: Jauge de progression style Gmail / EN: Gmail-style progress bar */}
      {uploading && (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 relative">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Téléchargement de {currentFileName}
              </span>
            </div>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* FR: Barre d'espace / EN: Space bar */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between"
          style={{ fontSize: 12, color: '#64748b' }}
        >
          <span className="font-medium">Espace utilisé</span>
          <span>
            {usagePercentage}% ({AssetUtils.formatFileSize(images.reduce((a, i) => a + i.size, 0))}{' '}
            /{AssetUtils.formatFileSize(50 * 1024 * 1024)})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              usagePercentage < 80
                ? 'bg-green-500'
                : usagePercentage < 95
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* FR: Liste des images / EN: Images list */}
      {images.length === 0 ? (
        <div className="py-8 text-center" style={{ fontSize: 12, color: '#64748b' }}>
          <p>Aucune image. Commencez par en ajouter une.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {images.map(image => (
            <div
              key={image.id}
              className="group relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer bg-white"
              onClick={() => setViewingImage(image)}
            >
              {/* FR: Aperçu redimensionné avec overlay d'actions / EN: Resized preview with actions overlay */}
              <div className="relative flex justify-center items-center bg-gray-50 p-2">
                <img
                  src={image.data}
                  alt={image.alt || image.fileName}
                  className="max-w-full max-h-48 object-contain transition-transform group-hover:scale-105"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    aspectRatio: `${image.width} / ${image.height}`,
                  }}
                />

                {/* FR: Boutons d'actions sur l'image en haut à droite / EN: Action buttons on image top right */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setViewingImage(image);
                    }}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-200"
                    title="Visionner"
                  >
                    <Eye size={14} className="text-gray-700" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDownload(image);
                    }}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-200"
                    title="Télécharger"
                  >
                    <Download size={14} className="text-gray-700" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleCopyDataUrl(image);
                    }}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-200"
                    title="Copier l'URL"
                  >
                    <Copy
                      size={14}
                      className={copiedId === image.id ? 'text-green-600' : 'text-gray-700'}
                    />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* FR: Métadonnées sur une ligne / EN: Metadata on single line */}
              <div className="p-2 bg-gray-50 text-xs border-t border-gray-200">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium truncate flex-1 mr-2" title={image.fileName}>
                    {image.fileName}
                  </span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {AssetUtils.formatFileSize(image.size)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FR: Info espace limite / EN: Space limit info */}
      {availableSpace < 1024 * 1024 && availableSpace > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          <AlertCircle size={16} />
          <span>Espace faible: {AssetUtils.formatFileSize(availableSpace)} restant</span>
        </div>
      )}

      {/* FR: Modal de visionnage plein écran / EN: Full screen viewing modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setViewingImage(null)}
        >
          {/* FR: Contrôles en haut / EN: Top controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={() => handleDownload(viewingImage)}
              className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all hover:scale-110"
              title="Télécharger"
            >
              <Download size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => {
                handleCopyDataUrl(viewingImage);
                setViewingImage(null);
              }}
              className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all hover:scale-110"
              title="Copier l'URL"
            >
              <Copy size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => setViewingImage(null)}
              className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all hover:scale-110"
              title="Fermer"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* FR: Informations en bas / EN: Bottom information */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold truncate">{viewingImage.fileName}</h3>
                <p className="text-sm text-gray-300">
                  {viewingImage.width} × {viewingImage.height}px •{' '}
                  {AssetUtils.formatFileSize(viewingImage.size)}
                </p>
              </div>
            </div>
          </div>

          {/* FR: Image en taille optimale / EN: Image at optimal size */}
          <div className="flex items-center justify-center w-full h-full p-8">
            <img
              src={viewingImage.data}
              alt={viewingImage.alt || viewingImage.fileName}
              className="max-w-full max-h-full object-contain"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
