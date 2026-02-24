/**
 * useSchemaInjection - React Hook for managing JSON-LD schema injection
 * Safely injects and manages structured data on the client side
 */

'use client';

import { useEffect } from 'react';
import { generateLocalBusinessSchema, injectSchemaScript } from '@/lib/schemaGenerator';

interface UseSchemaInjectionOptions {
  scriptId?: string;
  baseUrl?: string;
  autoInject?: boolean;
}

/**
 * React hook to manage schema injection on client components
 * 
 * @example
 * export default function MyComponent() {
 *   useSchemaInjection({ autoInject: true });
 *   return <div>Page content</div>;
 * }
 */
export function useSchemaInjection(options: UseSchemaInjectionOptions = {}) {
  const {
    scriptId = 'bluemind-schema-client',
    baseUrl = 'https://bluemindfreediving.nl',
    autoInject = true,
  } = options;

  useEffect(() => {
    if (autoInject && typeof window !== 'undefined') {
      const schema = generateLocalBusinessSchema({ baseUrl });
      injectSchemaScript(schema, scriptId);
    }
  }, [autoInject, baseUrl, scriptId]);

  // Return schema for manual use if needed
  const schema = generateLocalBusinessSchema({ baseUrl });
  return schema;
}

/**
 * Client-side component to inject additional schemas
 * Use this for page-specific schema injection
 * 
 * @example
 * export default function TrainingPage() {
 *   return (
 *     <>
 *       <SchemaInjector scriptId="training-schema" />
 *       <TrainingContent />
 *     </>
 *   );
 * }
 */
interface SchemaInjectorProps {
  schema?: Record<string, any>;
  scriptId?: string;
}

export function SchemaInjector({ 
  schema, 
  scriptId = 'bluemind-page-schema' 
}: SchemaInjectorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToInject = schema || generateLocalBusinessSchema();
      injectSchemaScript(dataToInject, scriptId);
    }
  }, [schema, scriptId]);

  return null; // This component only manages schema injection, doesn't render anything
}
