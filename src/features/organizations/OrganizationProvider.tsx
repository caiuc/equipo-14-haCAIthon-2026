import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAppAuth } from '@/auth/AppAuthProvider';
import type { Database, JoinRequestStatus } from '@/data/database.types';
import { requireSupabase } from '@/data/supabase';

export type OrganizationRecord = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMembership = Database['public']['Tables']['organization_memberships']['Row'];
export type OrganizationJoinRequest = Database['public']['Tables']['organization_join_requests']['Row'] & { requesterName: string };

interface OrganizationInput {
  name: string;
  description: string;
  accent: string;
}

interface OrganizationContextValue {
  organizations: OrganizationRecord[];
  memberships: OrganizationMembership[];
  requests: OrganizationJoinRequest[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  createOrganization: (input: OrganizationInput) => Promise<string>;
  requestJoin: (organizationId: string) => Promise<void>;
  reviewRequest: (requestId: string, decision: Extract<JoinRequestStatus, 'accepted' | 'rejected'>) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: React.PropsWithChildren) {
  const auth = useAppAuth();
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [requests, setRequests] = useState<OrganizationJoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!auth.user) {
      setOrganizations([]);
      setMemberships([]);
      setRequests([]);
      setError(undefined);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const client = requireSupabase();
      const [organizationResult, membershipResult, requestResult, profileResult] = await Promise.all([
        client.from('organizations').select('*').order('name'),
        client.from('organization_memberships').select('*').order('joined_at'),
        client.from('organization_join_requests').select('*').order('created_at', { ascending: false }),
        client.from('profiles').select('id, display_name'),
      ]);
      const firstError = organizationResult.error ?? membershipResult.error ?? requestResult.error ?? profileResult.error;
      if (firstError) throw firstError;
      const names = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile.display_name]));
      setOrganizations(organizationResult.data ?? []);
      setMemberships(membershipResult.data ?? []);
      setRequests((requestResult.data ?? []).map((request) => ({
        ...request,
        requesterName: names.get(request.user_id) ?? 'Usuario Retorna',
      })));
    } catch {
      setError('No pudimos cargar las organizaciones. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timeout = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timeout);
  }, [refresh]);

  const createOrganization = useCallback(async ({ name, description, accent }: OrganizationInput) => {
    const client = requireSupabase();
    const { data, error: rpcError } = await client.rpc('create_organization', {
      organization_name: name.trim(),
      organization_description: description.trim(),
      organization_accent: accent,
    });
    if (rpcError || !data) throw new Error(rpcError?.message.includes('organizations_slug_key') ? 'Ya existe una organización con ese nombre.' : 'No pudimos crear la organización.');
    await refresh();
    return data;
  }, [refresh]);

  const requestJoin = useCallback(async (organizationId: string) => {
    if (!auth.user) throw new Error('Debes iniciar sesión para solicitar acceso.');
    const client = requireSupabase();
    const existing = requests.find((request) => request.organization_id === organizationId && request.user_id === auth.user?.id);
    const result = existing?.status === 'rejected'
      ? await client.from('organization_join_requests').update({ status: 'pending', resolved_at: null, resolved_by: null, created_at: new Date().toISOString() }).eq('id', existing.id)
      : await client.from('organization_join_requests').insert({ organization_id: organizationId, user_id: auth.user.id });
    if (result.error) throw new Error('No pudimos enviar la solicitud. Inténtalo nuevamente.');
    await refresh();
  }, [auth.user, refresh, requests]);

  const reviewRequest = useCallback(async (requestId: string, decision: 'accepted' | 'rejected') => {
    const client = requireSupabase();
    const { error: rpcError } = await client.rpc('review_organization_join_request', { request_id: requestId, decision });
    if (rpcError) throw new Error('No pudimos actualizar la solicitud. Revisa tus permisos.');
    await refresh();
  }, [refresh]);

  const value = useMemo<OrganizationContextValue>(() => ({
    organizations,
    memberships,
    requests,
    loading,
    error,
    refresh,
    createOrganization,
    requestJoin,
    reviewRequest,
  }), [createOrganization, error, loading, memberships, organizations, refresh, requestJoin, requests, reviewRequest]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizations() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error('useOrganizations debe usarse dentro de OrganizationProvider.');
  return value;
}
