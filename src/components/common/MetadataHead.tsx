'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { getPageMetadata, generateMetaTags } from '@/utils/metadataUtils';
import { useEffect } from 'react';

interface MetadataHeadProps {
  customMetadata?: {
    title?: string;
    description?: string;
    keywords?: string;
    'og:title'?: string;
    'og:description'?: string;
    'og:image'?: string;
    'og:url'?: string;
    'twitter:title'?: string;
    'twitter:description'?: string;
    'twitter:image'?: string;
    canonical?: string;
  };
}

/**
 * Client-side metadata component for pages that need dynamic metadata
 * This component updates the document head with metadata based on the current route
 */
export default function MetadataHead({ customMetadata }: MetadataHeadProps) {
  const pathname = usePathname();
  const metadata = getPageMetadata(pathname, customMetadata);
  const metaTags = generateMetaTags(metadata);

  useEffect(() => {
    // Update document title
    document.title = metadata.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = metadata.description;
      document.head.appendChild(newMeta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.keywords);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'keywords';
      newMeta.content = metadata.keywords;
      document.head.appendChild(newMeta);
    }

    // Update Open Graph tags
    const ogTags = [
      { property: 'og:title', content: metadata['og:title'] },
      { property: 'og:description', content: metadata['og:description'] },
      { property: 'og:image', content: metadata['og:image'] },
      { property: 'og:url', content: metadata['og:url'] },
      { property: 'og:type', content: metadata['og:type'] },
      { property: 'og:site_name', content: metadata['og:site_name'] },
    ];

    ogTags.forEach(({ property, content }) => {
      const existingTag = document.querySelector(`meta[property="${property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.setAttribute('property', property);
        newMeta.content = content;
        document.head.appendChild(newMeta);
      }
    });

    // Update Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: metadata['twitter:card'] },
      { name: 'twitter:title', content: metadata['twitter:title'] },
      { name: 'twitter:description', content: metadata['twitter:description'] },
      { name: 'twitter:image', content: metadata['twitter:image'] },
    ];

    twitterTags.forEach(({ name, content }) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = name;
        newMeta.content = content;
        document.head.appendChild(newMeta);
      }
    });

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', metadata.canonical);

  }, [metadata, pathname]);

  return null; // This component doesn't render anything visible
}
