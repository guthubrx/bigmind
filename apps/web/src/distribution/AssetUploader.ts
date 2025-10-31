/**
 * Asset Uploader
 * Upload assets to CDN with integrity checks
 * Phase 4 - Sprint 2 - CORE
 */

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  hash: string;
  size: number;
  integrity: string; // SRI hash
}

/**
 * AssetUploader - Upload to CDN with SRI
 */
export class AssetUploader {
  private cdnUrl: string;

  private apiKey?: string;

  constructor(cdnUrl: string, apiKey?: string) {
    this.cdnUrl = cdnUrl;
    this.apiKey = apiKey;
  }

  /**
   * Upload file to CDN
   */
  async upload(
    path: string,
    content: Uint8Array | Blob,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // Calculate hash
    const hash = await this.calculateHash(content);
    const integrity = await this.calculateSRI(content);

    // Build URL
    const url = `${this.cdnUrl}/${path}`;

    // Simulate upload (replace with actual S3/CDN upload)
    const size = content instanceof Blob ? content.size : content.byteLength;

    if (options.onProgress) {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        options.onProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return {
      url,
      hash,
      size,
      integrity,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadBatch(
    files: Array<{ path: string; content: Uint8Array | Blob; options?: UploadOptions }>
  ): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.upload(file.path, file.content, file.options)));
  }

  /**
   * Calculate SHA-256 hash
   */
  private async calculateHash(content: Uint8Array | Blob): Promise<string> {
    // Note: Blob support is browser-only
    const buffer = content instanceof Blob ? await content.arrayBuffer() : content;
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calculate SRI (Subresource Integrity) hash
   */
  private async calculateSRI(content: Uint8Array | Blob): Promise<string> {
    const buffer = content instanceof Blob ? await content.arrayBuffer() : content;
    const hashBuffer = await crypto.subtle.digest('SHA-384', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode(...hashArray));
    return `sha384-${base64}`;
  }

  /**
   * Delete asset from CDN
   */
  async delete(path: string): Promise<boolean> {
    // Implement CDN deletion
    return true;
  }
}

/**
 * Create asset uploader
 */
export function createAssetUploader(cdnUrl: string, apiKey?: string): AssetUploader {
  return new AssetUploader(cdnUrl, apiKey);
}
