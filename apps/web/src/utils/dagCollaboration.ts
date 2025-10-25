/**
 * FR: Métadonnées de collaboration pour le DAG
 * EN: Collaboration metadata for DAG
 */

import { DagTag, DagLink } from '../types/dag';

export interface CollaborationMetadata {
  createdBy?: string;
  createdAt?: number;
  lastModifiedBy?: string;
  lastModifiedAt?: number;
  editors?: string[];
  comments?: CollaborationComment[];
  shareWith?: string[];
  isPublic?: boolean;
  version?: number;
}

export interface CollaborationComment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  resolved?: boolean;
}

export interface DagWithCollaboration {
  id: string;
  name: string;
  description?: string;
  tags: DagTag[];
  links: DagLink[];
  metadata: CollaborationMetadata;
}

// Enhanced tag with collaboration data
export interface CollaborativeTag extends DagTag {
  metadata?: CollaborationMetadata;
}

// Change tracking for conflict resolution
export interface DagChange {
  id: string;
  type: 'tag-add' | 'tag-update' | 'tag-delete' | 'link-add' | 'link-delete';
  timestamp: number;
  author: string;
  changes: Record<string, any>;
  targetId: string;
}

/**
 * FR: Créer des métadonnées de base pour la collaboration
 * EN: Create base collaboration metadata
 */
export const createCollaborationMetadata = (currentUser: string): CollaborationMetadata => ({
  createdBy: currentUser,
  createdAt: Date.now(),
  lastModifiedBy: currentUser,
  lastModifiedAt: Date.now(),
  editors: [currentUser],
  comments: [],
  shareWith: [],
  isPublic: false,
  version: 1,
});

/**
 * FR: Ajouter un commentaire à un tag
 * EN: Add a comment to a tag
 */
export const addComment = (
  metadata: CollaborationMetadata,
  author: string,
  content: string
): CollaborationMetadata => {
  const comment: CollaborationComment = {
    id: `comment-${Date.now()}`,
    author,
    content,
    timestamp: Date.now(),
    resolved: false,
  };

  return {
    ...metadata,
    comments: [...(metadata.comments || []), comment],
    lastModifiedBy: author,
    lastModifiedAt: Date.now(),
  };
};

/**
 * FR: Marquer un changement
 * EN: Track a change
 */
export const trackChange = (
  type: DagChange['type'],
  targetId: string,
  author: string,
  changes: Record<string, any>
): DagChange => ({
  id: `change-${Date.now()}`,
  type,
  timestamp: Date.now(),
  author,
  changes,
  targetId,
});

/**
 * FR: Vérifier les droits d'accès
 * EN: Check access permissions
 */
export const canAccess = (metadata: CollaborationMetadata, user: string): boolean => {
  if (metadata.isPublic) return true;
  if (metadata.createdBy === user) return true;
  if (metadata.editors?.includes(user)) return true;
  if (metadata.shareWith?.includes(user)) return true;
  return false;
};

/**
 * FR: Partager le DAG avec un utilisateur
 * EN: Share DAG with a user
 */
export const shareWith = (metadata: CollaborationMetadata, user: string): CollaborationMetadata => {
  if (!metadata.shareWith) {
    metadata.shareWith = [];
  }
  if (!metadata.shareWith.includes(user)) {
    metadata.shareWith.push(user);
  }
  return metadata;
};

/**
 * FR: Marquer comme public
 * EN: Mark as public
 */
export const makePublic = (metadata: CollaborationMetadata): CollaborationMetadata => ({
  ...metadata,
  isPublic: true,
});

/**
 * FR: Incrémenter la version
 * EN: Increment version
 */
export const incrementVersion = (metadata: CollaborationMetadata): CollaborationMetadata => ({
  ...metadata,
  version: (metadata.version || 1) + 1,
});
