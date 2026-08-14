export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrganizationRole = 'member' | 'admin' | 'owner';
export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; display_name: string; initials: string; avatar_color: string; bio: string | null; affiliation: string | null; campus: string | null; created_at: string };
        Insert: { id: string; username: string; display_name: string; initials: string; avatar_color?: string; bio?: string | null; affiliation?: string | null; campus?: string | null; created_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      organizations: {
        Row: { id: string; name: string; slug: string; description: string; accent: string; created_by: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; description: string; accent?: string; created_by: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      organization_memberships: {
        Row: { id: string; organization_id: string; user_id: string; role: OrganizationRole; joined_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; role?: OrganizationRole; joined_at?: string };
        Update: Partial<Database['public']['Tables']['organization_memberships']['Insert']>;
        Relationships: [];
      };
      organization_join_requests: {
        Row: { id: string; organization_id: string; user_id: string; status: JoinRequestStatus; created_at: string; resolved_at: string | null; resolved_by: string | null };
        Insert: { id?: string; organization_id: string; user_id: string; status?: JoinRequestStatus; created_at?: string; resolved_at?: string | null; resolved_by?: string | null };
        Update: Partial<Database['public']['Tables']['organization_join_requests']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: { Args: { organization_name: string; organization_description: string; organization_accent: string }; Returns: string };
      review_organization_join_request: { Args: { request_id: string; decision: JoinRequestStatus }; Returns: undefined };
    };
    Enums: { organization_role: OrganizationRole; organization_join_request_status: JoinRequestStatus };
    CompositeTypes: Record<string, never>;
  };
}
