/**
 * Asset Versioning
 * Generate versioned URLs and manifests
 * Phase 4 - Sprint 2 - CORE
 */

export interface AssetManifest {
  version: string;
  assets: Record<string, AssetInfo>;
  generatedAt: string;
}

export interface AssetInfo {
  path: string;
  url: string;
  hash: string;
  size: number;
  integrity: string;
  contentType?: string;
}

/**
 * AssetVersioning - Immutable asset URLs
 */
export class AssetVersioning {
  private cdnUrl: string;
  private manifest: AssetManifest;

  constructor(cdnUrl: string, version: string) {
    this.cdnUrl = cdnUrl;
    this.manifest = {
      version,
      assets: {},
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Add asset to manifest
   */
  addAsset(name: string, info: AssetInfo): void {
    this.manifest.assets[name] = info;
  }

  /**
   * Generate versioned URL with content hash
   */
  generateVersionedUrl(path: string, hash: string): string {
    const ext = path.split('.').pop();
    const basePath = path.slice(0, -(ext!.length + 1));
    return `${this.cdnUrl}/${basePath}.${hash.slice(0, 8)}.${ext}`;
  }

  /**
   * Get asset URL by name
   */
  getAssetUrl(name: string): string | null {
    const asset = this.manifest.assets[name];
    return asset ? asset.url : null;
  }

  /**
   * Get SRI integrity for asset
   */
  getAssetIntegrity(name: string): string | null {
    const asset = this.manifest.assets[name];
    return asset ? asset.integrity : null;
  }

  /**
   * Export manifest as JSON
   */
  exportManifest(): string {
    return JSON.stringify(this.manifest, null, 2);
  }

  /**
   * Load manifest from JSON
   */
  static loadManifest(json: string, cdnUrl: string): AssetVersioning {
    const manifest = JSON.parse(json) as AssetManifest;
    const versioning = new AssetVersioning(cdnUrl, manifest.version);
    versioning.manifest = manifest;
    return versioning;
  }

  /**
   * Get all assets
   */
  getAllAssets(): Record<string, AssetInfo> {
    return { ...this.manifest.assets };
  }

  /**
   * Get manifest version
   */
  getVersion(): string {
    return this.manifest.version;
  }
}

/**
 * Create asset versioning
 */
export function createAssetVersioning(cdnUrl: string, version: string): AssetVersioning {
  return new AssetVersioning(cdnUrl, version);
}
