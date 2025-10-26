/**
 * FR: Hook pour gérer la collaboration sur le DAG
 * EN: Hook for managing DAG collaboration
 */

import { useCallback } from 'react';
import { useTagStore } from './useTagStore';
import {
  CollaborationMetadata,
  CollaborativeTag,
  createCollaborationMetadata,
  addComment as addCommentUtil,
  canAccess,
  shareWith as shareWithUtil,
  makePublic as makePublicUtil,
} from '../utils/dagCollaboration';

export const useDagCollaboration = () => {
  const tags = useTagStore(state => state.tags);

  // Initialize DAG metadata if not exists
  const initializeDagMetadata = useCallback(
    (user: string) => createCollaborationMetadata(user),
    []
  );

  // Add comment to DAG
  const addCommentToDag = useCallback(
    (metadata: CollaborationMetadata, author: string, content: string) =>
      addCommentUtil(metadata, author, content),
    []
  );

  // Share DAG with user
  const shareDagWith = useCallback(
    (metadata: CollaborationMetadata, user: string) => shareWithUtil(metadata, user),
    []
  );

  // Make DAG public
  const makeDagPublic = useCallback(
    (metadata: CollaborationMetadata) => makePublicUtil(metadata),
    []
  );

  // Check if user can access
  const hasAccess = useCallback(
    (metadata: CollaborationMetadata, user: string) => canAccess(metadata, user),
    []
  );

  // Get collaborative tags
  const getCollaborativeTags = useCallback(
    (): CollaborativeTag[] =>
      Object.values(tags).map((tag: any) => ({
        ...tag,
        metadata: tag.metadata || {},
      })),
    [tags]
  );

  // Add metadata to tag
  const updateTagMetadata = useCallback(
    (tagId: string, metadata: CollaborationMetadata) => {
      const tag = tags[tagId];
      if (!tag) {
        return null;
      }

      return {
        ...tag,
        metadata,
      };
    },
    [tags]
  );

  // Track contributor
  const trackContributor = useCallback((metadata: CollaborationMetadata, user: string) => {
    const editors = metadata.editors || [];
    if (!editors.includes(user)) {
      editors.push(user);
    }
    return {
      ...metadata,
      editors,
      lastModifiedBy: user,
      lastModifiedAt: Date.now(),
    };
  }, []);

  return {
    initializeDagMetadata,
    addCommentToDag,
    shareDagWith,
    makeDagPublic,
    hasAccess,
    getCollaborativeTags,
    updateTagMetadata,
    trackContributor,
  };
};
