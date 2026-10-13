export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export type LeadSource =
  | 'website_quote_form'
  | 'website_quote_wizard'
  | 'website_contact_section'
  | 'website';

export interface Database {
  public: {
    Tables: {
      quote_requests: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string;
          email: string | null;
          service: string | null;
          space_type: string | null;
          estimated_area: string | null;
          desired_timeline: string | null;
          location: string | null;
          message: string | null;
          status: LeadStatus;
          source: LeadSource;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          phone: string;
          email?: string | null;
          service?: string | null;
          space_type?: string | null;
          estimated_area?: string | null;
          desired_timeline?: string | null;
          location?: string | null;
          message?: string | null;
          status?: LeadStatus;
          source?: LeadSource;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          service?: string | null;
          space_type?: string | null;
          estimated_area?: string | null;
          desired_timeline?: string | null;
          location?: string | null;
          message?: string | null;
          status?: LeadStatus;
          source?: LeadSource;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type QuoteRequestRow = Database['public']['Tables']['quote_requests']['Row'];
export type QuoteRequestInsert = Database['public']['Tables']['quote_requests']['Insert'];
export type QuoteRequestUpdate = Database['public']['Tables']['quote_requests']['Update'];
