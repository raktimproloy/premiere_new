'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPageMetadata, PageMetadata } from '@/utils/metadataUtils';

/**
 * Client-side hook for getting page metadata
 * @param customMetadata - Optional custom metadata to override specific values
 * @returns Metadata object and helper functions
 */
export function useMetadata(customMetadata?: Partial<PageMetadata>) {
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);

  useEffect(() => {
    const pageMetadata = getPageMetadata(pathname, customMetadata);
    setMetadata(pageMetadata);
  }, [pathname, customMetadata]);

  return {
    metadata,
    isLoading: metadata === null,
  };
}

/**
 * Hook for updating document head with metadata
 * @param customMetadata - Optional custom metadata to override specific values
 */
export function useDocumentMetadata(customMetadata?: Partial<PageMetadata>) {
  const { metadata, isLoading } = useMetadata(customMetadata);

  useEffect(() => {
    if (!metadata) return;

    // Update document title
    document.title = metadata.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.keywords);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', metadata['og:title']);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', metadata['og:description']);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', metadata['og:image']);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', metadata['og:url']);
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', metadata['twitter:title']);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', metadata['twitter:description']);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', metadata['twitter:image']);
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', metadata.canonical);

  }, [metadata]);

  return {
    metadata,
    isLoading,
  };
}
