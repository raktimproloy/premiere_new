import metadataConfig from '../../public/data/metadata.json';

export interface MetadataConfig {
  default: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    robots: string;
    'og:title': string;
    'og:description': string;
    'og:image': string;
    'og:url': string;
    'og:type': string;
    'og:site_name': string;
    'twitter:card': string;
    'twitter:title': string;
    'twitter:description': string;
    'twitter:image': string;
    canonical: string;
  };
  pages: {
    [key: string]: {
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
  };
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  'og:title': string;
  'og:description': string;
  'og:image': string;
  'og:url': string;
  'og:type': string;
  'og:site_name': string;
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  canonical: string;
}

/**
 * Get metadata for a specific page with fallback to default values
 * @param pathname - The current page pathname (e.g., "/", "/about", "/contact")
 * @param customMetadata - Optional custom metadata to override specific values
 * @returns Complete metadata object with fallbacks applied
 */
export function getPageMetadata(
  pathname: string = '/',
  customMetadata?: Partial<PageMetadata>
): PageMetadata {
  const config = metadataConfig as MetadataConfig;
  const defaultMeta = config.default;
  const pageMeta = config.pages[pathname] || {};

  // Merge page-specific metadata with defaults
  const mergedMetadata: PageMetadata = {
    title: pageMeta.title || defaultMeta.title,
    description: pageMeta.description || defaultMeta.description,
    keywords: pageMeta.keywords || defaultMeta.keywords,
    author: defaultMeta.author, // Always use default author
    robots: defaultMeta.robots, // Always use default robots
    'og:title': pageMeta['og:title'] || pageMeta.title || defaultMeta['og:title'],
    'og:description': pageMeta['og:description'] || pageMeta.description || defaultMeta['og:description'],
    'og:image': pageMeta['og:image'] || defaultMeta['og:image'],
    'og:url': pageMeta['og:url'] || `${defaultMeta['og:url']}${pathname}`,
    'og:type': defaultMeta['og:type'], // Always use default type
    'og:site_name': defaultMeta['og:site_name'], // Always use default site name
    'twitter:card': defaultMeta['twitter:card'], // Always use default card type
    'twitter:title': pageMeta['twitter:title'] || pageMeta.title || defaultMeta['twitter:title'],
    'twitter:description': pageMeta['twitter:description'] || pageMeta.description || defaultMeta['twitter:description'],
    'twitter:image': pageMeta['twitter:image'] || pageMeta['og:image'] || defaultMeta['twitter:image'],
    canonical: pageMeta.canonical || `${defaultMeta.canonical}${pathname}`,
  };

  // Apply any custom metadata overrides
  if (customMetadata) {
    Object.assign(mergedMetadata, customMetadata);
  }

  return mergedMetadata;
}

/**
 * Generate HTML meta tags from metadata object
 * @param metadata - The metadata object
 * @returns Array of meta tag objects for Next.js Head component
 */
export function generateMetaTags(metadata: PageMetadata) {
  return [
    // Basic meta tags
    { name: 'title', content: metadata.title },
    { name: 'description', content: metadata.description },
    { name: 'keywords', content: metadata.keywords },
    { name: 'author', content: metadata.author },
    { name: 'robots', content: metadata.robots },
    
    // Open Graph tags
    { property: 'og:title', content: metadata['og:title'] },
    { property: 'og:description', content: metadata['og:description'] },
    { property: 'og:image', content: metadata['og:image'] },
    { property: 'og:url', content: metadata['og:url'] },
    { property: 'og:type', content: metadata['og:type'] },
    { property: 'og:site_name', content: metadata['og:site_name'] },
    
    // Twitter Card tags
    { name: 'twitter:card', content: metadata['twitter:card'] },
    { name: 'twitter:title', content: metadata['twitter:title'] },
    { name: 'twitter:description', content: metadata['twitter:description'] },
    { name: 'twitter:image', content: metadata['twitter:image'] },
  ];
}

/**
 * Generate Next.js metadata object for app directory
 * @param pathname - The current page pathname
 * @param customMetadata - Optional custom metadata to override specific values
 * @returns Next.js metadata object
 */
export function generateNextMetadata(
  pathname: string = '/',
  customMetadata?: Partial<PageMetadata>
) {
  const metadata = getPageMetadata(pathname, customMetadata);
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: metadata.author }],
    robots: metadata.robots,
    openGraph: {
      title: metadata['og:title'],
      description: metadata['og:description'],
      url: metadata['og:url'],
      siteName: metadata['og:site_name'],
      images: [
        {
          url: metadata['og:image'],
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
      locale: 'en_US',
      type: metadata['og:type'],
    },
    twitter: {
      card: metadata['twitter:card'],
      title: metadata['twitter:title'],
      description: metadata['twitter:description'],
      images: [metadata['twitter:image']],
    },
    alternates: {
      canonical: metadata.canonical,
    },
  };
}

/**
 * Hook for getting metadata in client components
 * @param pathname - The current page pathname
 * @param customMetadata - Optional custom metadata to override specific values
 * @returns Metadata object and helper functions
 */
export function usePageMetadata(
  pathname: string = '/',
  customMetadata?: Partial<PageMetadata>
) {
  const metadata = getPageMetadata(pathname, customMetadata);
  
  return {
    metadata,
    generateMetaTags: () => generateMetaTags(metadata),
    generateNextMetadata: () => generateNextMetadata(pathname, customMetadata),
  };
}
