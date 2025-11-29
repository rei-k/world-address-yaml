/**
 * @vey/react - React context and hooks for address management
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import {
  VeyClient,
  createVeyClient,
  VeyConfig,
  AddressInput,
  ValidationResult,
  CountryAddressFormat,
  RegionHierarchy,
} from '@vey/core';

// Context for Vey client
interface VeyContextValue {
  client: VeyClient;
  isReady: boolean;
}

const VeyContext = createContext<VeyContextValue | null>(null);

// Provider props
export interface VeyProviderProps {
  config?: VeyConfig;
  children: ReactNode;
}

/**
 * Provider component for Vey SDK
 */
export function VeyProvider({ config, children }: VeyProviderProps): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  const client = useMemo(() => createVeyClient(config), [config]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const value = useMemo(() => ({ client, isReady }), [client, isReady]);

  return <VeyContext.Provider value={value}>{children}</VeyContext.Provider>;
}

/**
 * Hook to access Vey client
 */
export function useVeyClient(): VeyClient {
  const context = useContext(VeyContext);
  if (!context) {
    throw new Error('useVeyClient must be used within a VeyProvider');
  }
  return context.client;
}

/**
 * Hook for address validation
 */
export function useAddressValidation(countryCode: string) {
  const client = useVeyClient();
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validate = useCallback(
    async (address: AddressInput) => {
      setIsValidating(true);
      try {
        const validationResult = await client.validate(address, countryCode);
        setResult(validationResult);
        return validationResult;
      } finally {
        setIsValidating(false);
      }
    },
    [client, countryCode]
  );

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    validate,
    reset,
    isValidating,
    result,
    isValid: result?.valid ?? null,
    errors: result?.errors ?? [],
    warnings: result?.warnings ?? [],
  };
}

/**
 * Hook for country address format
 */
export function useCountryFormat(countryCode: string) {
  const client = useVeyClient();
  const [format, setFormat] = useState<CountryAddressFormat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFormat() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedFormat = await client.getCountryFormat(countryCode);
        if (!cancelled) {
          setFormat(loadedFormat);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load format'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFormat();

    return () => {
      cancelled = true;
    };
  }, [client, countryCode]);

  return { format, isLoading, error };
}

/**
 * Hook for address form state
 */
export function useAddressForm(initialValue: AddressInput = {}) {
  const [address, setAddress] = useState<AddressInput>(initialValue);

  const updateField = useCallback(
    (field: keyof AddressInput, value: string) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setAddress(initialValue);
  }, [initialValue]);

  const setAll = useCallback((newAddress: AddressInput) => {
    setAddress(newAddress);
  }, []);

  return {
    address,
    updateField,
    reset,
    setAll,
  };
}

/**
 * Hook for region hierarchy (hierarchical picker)
 */
export function useRegionHierarchy() {
  const client = useVeyClient();
  const [hierarchy, setHierarchy] = useState<RegionHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHierarchy() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await client.getRegionHierarchy();
        if (!cancelled) {
          setHierarchy(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load hierarchy'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHierarchy();

    return () => {
      cancelled = true;
    };
  }, [client]);

  return { hierarchy, isLoading, error };
}

/**
 * Hook for required fields
 */
export function useRequiredFields(countryCode: string) {
  const client = useVeyClient();
  const [fields, setFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFields() {
      setIsLoading(true);
      try {
        const requiredFields = await client.getRequiredFields(countryCode);
        if (!cancelled) {
          setFields(requiredFields);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFields();

    return () => {
      cancelled = true;
    };
  }, [client, countryCode]);

  return { fields, isLoading };
}
