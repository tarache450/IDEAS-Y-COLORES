import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Shield,
  Send,
  Trash2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Building2,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  supabase,
  QuoteRequestRecord,
  QuoteStatus,
  QuotePriority,
  QuoteNote,
  QuoteStats,
  signInAdmin,
  signUpAdmin,
  signOutAdmin,
  getAdminSession,
  fetchQuoteRequests,
  updateQuoteStatus,
  updateQuoteDetails,
  deleteQuoteRequest,
  fetchQuoteNotes,
  addQuoteNote,
  fetchQuoteStats,
} from '../../lib/supabase';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

const STATUS_LABELS: Record<QuoteStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'Nueva', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  contacted: { label: 'Contactado', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  in_progress: { label: 'En Negociación', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  quoted: { label: 'Presupuestado', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  won: { label: 'Ganado / Cerrado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  lost: { label: 'Perdido', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const PRIORITY_LABELS: Record<QuotePriority, { label: string; color: string; badge: string }> = {
  low: { label: 'Baja', color: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300' },
  normal: { label: 'Normal', color: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  high: { label: 'Alta', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  urgent: { label: 'Urgente', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300' },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  // Authentication State
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // CRM Data State
  const [leads, setLeads] = useState<QuoteRequestRecord[]>([]);
  const [stats, setStats] = useState<QuoteStats>({
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    in_progress_leads: 0,
    quoted_leads: 0,
    won_leads: 0,
    lost_leads: 0,
    leads_last_30_days: 0,
    total_won_revenue: 0,
  });
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<QuoteRequestRecord | null>(null);

  // Lead Modal / Notes State
  const [activeNotes, setActiveNotes] = useState<QuoteNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const { session, user } = await getAdminSession();
      if (session && user) {
        setSessionUser(user);
      }
      setAuthLoading(false);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch leads and stats when user is authenticated
  const loadLeadsData = async () => {
    if (!sessionUser) return;
    setLoadingData(true);
    const [leadsRes, statsRes] = await Promise.all([
      fetchQuoteRequests({
        status: selectedStatusFilter === 'all' ? undefined : selectedStatusFilter,
        search: searchTerm,
      }),
      fetchQuoteStats(),
    ]);

    if (!leadsRes.error) {
      setLeads(leadsRes.data);
    }
    if (!statsRes.error) {
      setStats(statsRes.stats);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (sessionUser) {
      loadLeadsData();
    }
  }, [sessionUser, selectedStatusFilter, searchTerm]);

  // Load notes when a lead is selected
  useEffect(() => {
    if (selectedLead) {
      setLoadingNotes(true);
      fetchQuoteNotes(selectedLead.id).then(({ data }) => {
        setActiveNotes(data);
        setLoadingNotes(false);
      });
    } else {
      setActiveNotes([]);
    }
  }, [selectedLead]);

  // Handle Login / Sign Up
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    if (authMode === 'login') {
      const { user, error } = await signInAdmin(authEmail, authPassword);
      if (error) {
        setAuthError(error.message);
      } else {
        setSessionUser(user);
      }
    } else {
      const { user, error } = await signUpAdmin(authEmail, authPassword);
      if (error) {
        setAuthError(error.message);
      } else {
        setSessionUser(user);
        alert('Cuenta creada. Si Supabase requiere confirmación por email, por favor revisa tu bandeja de entrada.');
      }
    }
    setAuthSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setSessionUser(null);
  };

  // Lead status quick update
  const handleStatusChange = async (leadId: string, newStatus: QuoteStatus) => {
    setSavingChanges(true);
    const { error } = await updateQuoteStatus(leadId, newStatus);
    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      fetchQuoteStats().then(({ stats }) => setStats(stats));
    }
    setSavingChanges(false);
  };

  // Lead details update
  const handleSaveLeadDetails = async (updates: Partial<QuoteRequestRecord>) => {
    if (!selectedLead) return;
    setSavingChanges(true);
    const { error } = await updateQuoteDetails(selectedLead.id, updates);
    if (!error) {
      const updated = { ...selectedLead, ...updates };
      setSelectedLead(updated);
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
    }
    setSavingChanges(false);
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cotización? Esta acción no se puede deshacer.')) return;
    const { error } = await deleteQuoteRequest(leadId);
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
      fetchQuoteStats().then(({ stats }) => setStats(stats));
    }
  };

  // Add internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteContent.trim() || !sessionUser) return;
    const { data, error } = await addQuoteNote(selectedLead.id, newNoteContent, sessionUser.email || 'Admin');
    if (!error && data) {
      setActiveNotes((prev) => [data, ...prev]);
      setNewNoteContent('');
    }
  };

  // WhatsApp helper
  const openWhatsApp = (phone: string, clientName: string, service?: string | null) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('502') ? cleanPhone : `502${cleanPhone}`;
    const text = encodeURIComponent(
      `¡Hola ${clientName}! Te saluda el equipo de Ideas & Colores Multi-Servicios 🎨. Recibimos tu solicitud de cotización para ${service || 'tu proyecto'}. ¿En qué horario te resultaría más cómodo coordinar una breve llamada o visita técnica?`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  // CSV Export helper
  const exportToCSV = () => {
    if (leads.length === 0) {
      alert('No hay cotizaciones para exportar.');
      return;
    }

    const headers = ['Fecha', 'Cliente', 'Teléfono', 'Email', 'Servicio', 'Tipo de Espacio', 'Área Estimada', 'Ubicación', 'Estado', 'Prioridad', 'Presupuesto Estimado', 'Mensaje'];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString('es-GT'),
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.service || '').replace(/"/g, '""')}"`,
      `"${(l.space_type || '').replace(/"/g, '""')}"`,
      `"${(l.estimated_area || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      STATUS_LABELS[l.status]?.label || l.status,
      PRIORITY_LABELS[l.priority]?.label || l.priority,
      l.budget_estimate ? `Q${l.budget_estimate}` : '',
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ideas_y_colores_cotizaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency Q
  const formatQ = (amount: number) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(amount);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Verificando sesión segura de Supabase...</p>
        </div>
      </div>
    );
  }

  // Auth Screen (Login / Signup)
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center mb-4">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al sitio web principal
            </button>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Ideas & Colores CRM
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Panel Administrativo de Control y Cotizaciones
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
            <form className="space-y-5" onSubmit={handleAuthSubmit}>
              {authError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="admin@ideasycoloresgt.site"
                    className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {authMode === 'login' ? 'Iniciar Sesión en CRM' : 'Crear Cuenta Administrativa'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                {authMode === 'login'
                  ? '¿Primer acceso? Registrar nuevo administrador'
                  : '¿Ya tienes cuenta? Iniciar sesión aquí'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Main View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">Ideas & Colores</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                CRM Backend
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gestión de clientes, cotizaciones y estados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Sitio Web</span>
          </button>

          <button
            onClick={loadLeadsData}
            disabled={loadingData}
            title="Recargar datos"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[160px]">
              {sessionUser?.email}
            </span>
            <button
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Metrics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Leads</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.total_leads}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              +{stats.leads_last_30_days} últimos 30 días
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-sky-500/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Nuevas Solicitudes</span>
              <span className="relative flex h-2 w-2">
                {stats.new_leads > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">
              {stats.new_leads}
            </div>
            <span className="text-[11px] text-sky-400/70 mt-1">
              Requieren primer contacto
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-500/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>En Proceso</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
              {stats.contacted_leads + stats.in_progress_leads + stats.quoted_leads}
            </div>
            <span className="text-[11px] text-indigo-400/70 mt-1">
              {stats.quoted_leads} presupuestos entregados
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Ganados / Éxito</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats.won_leads}
            </div>
            <span className="text-[11px] text-emerald-400/70 mt-1">
              Proyectos confirmados
            </span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Facturación Cerrada</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {formatQ(stats.total_won_revenue)}
            </div>
            <span className="text-[11px] text-amber-400/70 mt-1">
              De proyectos ganados
            </span>
          </div>
        </section>

        {/* Search, Filter Bar and Tabs */}
        <section className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono, email, zona, servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status Count Info */}
            <div className="text-xs text-slate-400 flex items-center gap-2 justify-end">
              <span>Mostrando <strong>{leads.length}</strong> cotizaciones</span>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todas ({stats.total_leads})
            </button>
            {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatusFilter === st
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{STATUS_LABELS[st].label}</span>
                {st === 'new' && stats.new_leads > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-extrabold">
                    {stats.new_leads}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Leads Table & Cards */}
        <section className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {loadingData ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm">Cargando registros de cotizaciones...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-white">No se encontraron cotizaciones</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No hay solicitudes que coincidan con los filtros seleccionados o todavía no se han recibido en este estado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Cliente / Contacto</th>
                    <th className="py-3 px-4">Servicio & Ubicación</th>
                    <th className="py-3 px-4">Detalles</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Prioridad</th>
                    <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        <div className="font-semibold text-slate-200">
                          {new Date(lead.created_at).toLocaleDateString('es-GT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(lead.created_at).toLocaleTimeString('es-GT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                          {lead.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-600" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Service & Location */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-200 truncate">
                          {lead.service || 'Servicio General'}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-amber-500/70 shrink-0" />
                          <span>{lead.location || 'Guatemala'}</span>
                        </div>
                      </td>

                      {/* Space & Area */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {lead.space_type || 'No especificado'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lead.estimated_area ? `Área: ${lead.estimated_area}` : 'Sin área especificada'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as QuoteStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer ${
                            STATUS_LABELS[lead.status].bg
                          } ${STATUS_LABELS[lead.status].color} ${STATUS_LABELS[lead.status].border}`}
                        >
                          {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map((st) => (
                            <option key={st} value={st} className="bg-slate-900 text-white font-medium">
                              {STATUS_LABELS[st].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_LABELS[lead.priority || 'normal'].badge}`}>
                          {PRIORITY_LABELS[lead.priority || 'normal'].label}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Direct */}
                          <button
                            onClick={() => openWhatsApp(lead.phone, lead.name, lead.service)}
                            title="Abrir WhatsApp con mensaje pre-redactado"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            title="Llamar"
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Eliminar registro"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Lead Detail & Activity Drawer/Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-white tracking-tight">{selectedLead.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_LABELS[selectedLead.status].bg} ${STATUS_LABELS[selectedLead.status].color} ${STATUS_LABELS[selectedLead.status].border}`}>
                      {STATUS_LABELS[selectedLead.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Registrado el {new Date(selectedLead.created_at).toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Contact & Direct Channel Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Teléfono</div>
                      <a href={`tel:${selectedLead.phone}`} className="text-xs font-bold text-white hover:text-amber-400 transition-colors">
                        {selectedLead.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Email</div>
                      <div className="text-xs font-bold text-white truncate max-w-[150px]">
                        {selectedLead.email || 'No proporcionado'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Ubicación</div>
                      <div className="text-xs font-bold text-white truncate max-w-[150px]">
                        {selectedLead.location || 'Guatemala'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Project Requirements */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Servicio</span>
                    <span className="text-xs font-bold text-slate-200">{selectedLead.service || 'General'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo de Espacio</span>
                    <span className="text-xs font-bold text-slate-200">{selectedLead.space_type || 'N/A'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Área Estimada</span>
                    <span className="text-xs font-bold text-slate-200">{selectedLead.estimated_area || 'N/A'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tiempo Deseado</span>
                    <span className="text-xs font-bold text-slate-200">{selectedLead.desired_timeline || 'N/A'}</span>
                  </div>
                </div>

                {/* Client Message */}
                {selectedLead.message && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Mensaje original del cliente:</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      "{selectedLead.message}"
                    </p>
                  </div>
                )}

                {/* CRM Controls: Status, Priority, Budget */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Gestión del Lead y Presupuesto
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Estado de Pipeline</label>
                      <select
                        value={selectedLead.status}
                        onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as QuoteStatus)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_LABELS[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prioridad</label>
                      <select
                        value={selectedLead.priority || 'normal'}
                        onChange={(e) => handleSaveLeadDetails({ priority: e.target.value as QuotePriority })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {(Object.keys(PRIORITY_LABELS) as QuotePriority[]).map((pr) => (
                          <option key={pr} value={pr}>
                            {PRIORITY_LABELS[pr].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Presupuesto Estimado (Q)</label>
                      <input
                        type="number"
                        placeholder="ej. 7500"
                        defaultValue={selectedLead.budget_estimate || ''}
                        onBlur={(e) => handleSaveLeadDetails({ budget_estimate: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Activity & Team Notes Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Historial de Seguimiento y Notas Internas
                    </h4>
                    <span className="text-[10px] text-slate-500">{activeNotes.length} notas</span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar nota interna (ej: 'Llamé al cliente, visita agendada para el sábado 10:00 AM')..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteContent.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {loadingNotes ? (
                      <div className="text-center py-4 text-xs text-slate-500">Cargando notas...</div>
                    ) : activeNotes.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-600 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                        No hay notas internas registradas para esta cotización aún.
                      </div>
                    ) : (
                      activeNotes.map((note) => (
                        <div key={note.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span className="font-semibold text-amber-400/80">{note.author_email}</span>
                            <span>{new Date(note.created_at).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Cotización</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openWhatsApp(selectedLead.phone, selectedLead.name, selectedLead.service)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contactar por WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
