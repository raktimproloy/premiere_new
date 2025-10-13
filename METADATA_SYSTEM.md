# Metadata System Documentation

This document explains how to use the centralized metadata system for the Premiere Stays application.

## Overview

The metadata system provides a centralized way to manage SEO metadata (title, description, keywords, Open Graph, Twitter Cards, etc.) across all pages. It uses a JSON configuration file with default values and page-specific overrides.

## Files Structure

```
public/data/metadata.json          # Main metadata configuration
src/utils/metadataUtils.ts         # Core metadata utilities
src/hooks/useMetadata.ts           # Client-side hooks
src/components/common/MetadataHead.tsx  # Client component for metadata
```

## Configuration File

The `metadata.json` file contains:

- **default**: Default metadata values used as fallbacks
- **pages**: Page-specific metadata overrides

### Example Structure

```json
{
  "default": {
    "title": "Premiere Stays - Luxury Hotel & Resort Booking",
    "description": "Discover and book luxury hotels...",
    "keywords": "luxury hotels, resort booking...",
    "og:title": "Premiere Stays - Luxury Hotel...",
    "og:description": "Discover and book luxury hotels...",
    "og:image": "/images/hero_section.png",
    "og:url": "https://premierestays.com",
    "og:type": "website",
    "og:site_name": "Premiere Stays",
    "twitter:card": "summary_large_image",
    "twitter:title": "Premiere Stays - Luxury Hotel...",
    "twitter:description": "Discover and book luxury hotels...",
    "twitter:image": "/images/hero_section.png",
    "canonical": "https://premierestays.com"
  },
  "pages": {
    "/": {
      "title": "Home Page Specific Title",
      "description": "Home page specific description"
    },
    "/about": {
      "title": "About Us - Premiere Stays",
      "description": "Learn about Premiere Stays..."
    }
  }
}
```

## Usage Methods

### 1. Server Components (Recommended for App Router)

For server components in the App Router, use the `generateNextMetadata` function:

```typescript
import { generateNextMetadata } from '@/utils/metadataUtils';

// Generate metadata for the page
export const metadata = generateNextMetadata('/about');

export default function AboutPage() {
  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

### 2. Client Components

For client components, use the `MetadataHead` component:

```typescript
'use client';

import MetadataHead from '@/components/common/MetadataHead';

export default function ClientPage() {
  return (
    <div>
      <MetadataHead />
      {/* Your page content */}
    </div>
  );
}
```

### 3. Custom Metadata Overrides

You can override specific metadata values:

```typescript
// Server component with custom metadata
export const metadata = generateNextMetadata('/contact', {
  title: 'Custom Contact Page Title',
  description: 'Custom description for contact page'
});

// Client component with custom metadata
<MetadataHead 
  customMetadata={{
    title: 'Custom Title',
    'og:image': '/images/custom-image.jpg'
  }} 
/>
```

### 4. Using Hooks (Client Components)

For dynamic metadata in client components:

```typescript
'use client';

import { useDocumentMetadata } from '@/hooks/useMetadata';

export default function DynamicPage() {
  const { metadata, isLoading } = useDocumentMetadata({
    title: 'Dynamic Title'
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{metadata?.title}</h1>
      {/* Your content */}
    </div>
  );
}
```

## How Fallbacks Work

The system uses a hierarchical fallback approach:

1. **Custom metadata** (highest priority)
2. **Page-specific metadata** from `metadata.json`
3. **Default metadata** from `metadata.json` (lowest priority)

For example, if you have:

```json
{
  "default": {
    "title": "Default Title",
    "description": "Default Description"
  },
  "pages": {
    "/about": {
      "title": "About Page Title"
    }
  }
}
```

And you call `generateNextMetadata('/about')`, you'll get:
- `title`: "About Page Title" (from page-specific)
- `description`: "Default Description" (fallback to default)

## Supported Metadata Fields

- `title` - Page title
- `description` - Meta description
- `keywords` - Meta keywords
- `author` - Page author
- `robots` - Robots meta tag
- `og:title` - Open Graph title
- `og:description` - Open Graph description
- `og:image` - Open Graph image
- `og:url` - Open Graph URL
- `og:type` - Open Graph type
- `og:site_name` - Open Graph site name
- `twitter:card` - Twitter card type
- `twitter:title` - Twitter title
- `twitter:description` - Twitter description
- `twitter:image` - Twitter image
- `canonical` - Canonical URL

## Adding New Pages

To add metadata for a new page:

1. Add the page route to `metadata.json` under the `pages` section
2. Use the appropriate method (server or client component) in your page
3. The system will automatically use page-specific metadata with fallbacks to defaults

## Examples

### Home Page (Server Component)
```typescript
// src/app/page.tsx
import { generateNextMetadata } from '@/utils/metadataUtils';

export const metadata = generateNextMetadata('/');

export default function Home() {
  return <div>Home page content</div>;
}
```

### About Page (Client Component)
```typescript
// src/app/about/page.tsx
'use client';
import MetadataHead from '@/components/common/MetadataHead';

export default function AboutPage() {
  return (
    <div>
      <MetadataHead />
      <div>About page content</div>
    </div>
  );
}
```

### Dynamic Page with Custom Metadata
```typescript
// src/app/properties/[id]/page.tsx
import { generateNextMetadata } from '@/utils/metadataUtils';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  
  return generateNextMetadata('/properties', {
    title: `${property.name} - Premiere Stays`,
    description: `Book ${property.name} - ${property.description}`,
    'og:image': property.images[0]
  });
}
```

## Benefits

1. **Centralized Management**: All metadata in one place
2. **Consistent Fallbacks**: Automatic fallbacks to default values
3. **Type Safety**: TypeScript interfaces for all metadata
4. **SEO Optimized**: Includes all necessary SEO meta tags
5. **Social Media Ready**: Open Graph and Twitter Card support
6. **Flexible**: Supports both server and client components

## Best Practices

1. Always provide a default metadata configuration
2. Use server components with `generateNextMetadata` when possible
3. Override only the metadata fields you need to customize
4. Keep page-specific metadata focused and relevant
5. Test your metadata using browser dev tools or SEO tools
6. Ensure images used in Open Graph and Twitter Cards are accessible
