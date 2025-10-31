/**
 * Export Ratings Button
 * Download plugin ratings as CSV
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportRatingsToCSV } from '../../services/supabaseClient';
import { useToast } from '../../hooks/useToast';
import './ExportRatingsButton.css';

export interface ExportRatingsButtonProps {
  pluginId: string;
  pluginName: string;
}

export function ExportRatingsButton({ pluginId, pluginName }: ExportRatingsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { error: showError } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportRatingsToCSV(pluginId);

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${pluginName}-ratings.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('[ExportRatingsButton] Error:', error);
      showError("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      className="export-ratings-button"
      onClick={handleExport}
      disabled={isExporting}
      title="Télécharger les avis en CSV"
    >
      <Download size={14} />
      {isExporting ? 'Export...' : 'Export CSV'}
    </button>
  );
}

export default ExportRatingsButton;
