/**
 * Plugin Report Service
 * Handles reporting plugins for moderation
 */

import { supabase } from './supabaseClient';

/**
 * Report category types
 */
export type ReportCategory =
  | 'malware'
  | 'spam'
  | 'inappropriate'
  | 'broken'
  | 'copyright'
  | 'other';

/**
 * Report status types
 */
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

/**
 * Plugin Report Interface
 */
export interface PluginReport {
  id?: string;
  pluginId: string;
  category: ReportCategory;
  description: string;
  reporter_email?: string;
  reporter_ip?: string;
  status: ReportStatus;
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

/**
 * Report submission data
 */
export interface ReportSubmission {
  pluginId: string;
  category: ReportCategory;
  description: string;
  reporter_email?: string;
}

/**
 * Report counts by status
 */
export interface ReportCounts {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  rejected: number;
}

/**
 * Submit a new plugin report
 */
export async function submitPluginReport(
  submission: ReportSubmission
): Promise<{ success: boolean; error?: string }> {
  const { pluginId, category, description, reporter_email } = submission;

  // Validation
  if (!pluginId || !category || !description.trim()) {
    return { success: false, error: 'Invalid report data' };
  }

  if (description.trim().length < 10) {
    return { success: false, error: 'Description trop courte (minimum 10 caractères)' };
  }

  if (description.trim().length > 1000) {
    return { success: false, error: 'Description trop longue (maximum 1000 caractères)' };
  }

  // Get user IP for rate limiting (client-side approximation)
  const reporter_ip = await getClientIP();

  // Check rate limiting
  const canReport = await checkRateLimit(pluginId, reporter_ip);
  if (!canReport) {
    return {
      success: false,
      error: 'Limite atteinte : maximum 3 signalements par plugin par 24h',
    };
  }

  console.log('[PluginReportService] Submitting report:', {
    pluginId,
    category,
    description: `${description.substring(0, 50)}...`,
    reporter_ip,
  });

  try {
    // Insert report
    const { data, error } = await supabase
      .from('plugin_reports')
      .insert([
        {
          pluginId,
          category,
          description: description.trim(),
          reporter_email: reporter_email || null,
          reporter_ip,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[PluginReportService] Error submitting report:', error);
      return { success: false, error: error.message };
    }

    // Record submission for rate limiting
    await recordReportSubmission(pluginId, reporter_ip);

    console.log('[PluginReportService] ✅ Report submitted successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('[PluginReportService] Exception submitting report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all reports for a plugin
 */
export async function getPluginReports(pluginId: string): Promise<PluginReport[]> {
  const { data, error } = await supabase
    .from('plugin_reports')
    .select('*')
    .eq('pluginId', pluginId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PluginReportService] Error fetching reports:', error);
    return [];
  }

  return data || [];
}

/**
 * Get pending report count for a plugin
 */
export async function getPendingReportCount(pluginId: string): Promise<number> {
  const { count, error } = await supabase
    .from('plugin_reports')
    .select('*', { count: 'exact', head: true })
    .eq('pluginId', pluginId)
    .eq('status', 'pending');

  if (error) {
    console.error('[PluginReportService] Error counting reports:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get report counts by status for a plugin
 */
export async function getReportCounts(pluginId: string): Promise<ReportCounts> {
  const reports = await getPluginReports(pluginId);

  return {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };
}

/**
 * Admin: Get all reports with optional status filter
 */
export async function getAllReports(status?: ReportStatus): Promise<PluginReport[]> {
  let query = supabase.from('plugin_reports').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[PluginReportService] Error fetching all reports:', error);
    return [];
  }

  return data || [];
}

/**
 * Admin: Update report status
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  admin_note?: string
): Promise<boolean> {
  console.log('[PluginReportService] Updating report status:', { reportId, status });

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'resolved' || status === 'rejected') {
    updateData.reviewed_at = new Date().toISOString();
    // TODO: Get current user ID
    // updateData.reviewed_by = currentUserId;
  }

  if (admin_note) {
    updateData.admin_note = admin_note;
  }

  const { error } = await supabase.from('plugin_reports').update(updateData).eq('id', reportId);

  if (error) {
    console.error('[PluginReportService] Error updating report:', error);
    return false;
  }

  console.log('[PluginReportService] ✅ Report updated successfully');
  return true;
}

/**
 * Admin: Delete a report
 */
export async function deleteReport(reportId: string): Promise<boolean> {
  console.log('[PluginReportService] Deleting report:', reportId);

  const { error } = await supabase.from('plugin_reports').delete().eq('id', reportId);

  if (error) {
    console.error('[PluginReportService] Error deleting report:', error);
    return false;
  }

  console.log('[PluginReportService] ✅ Report deleted successfully');
  return true;
}

/**
 * Check if user can submit a report (rate limiting)
 */
async function checkRateLimit(pluginId: string, ip: string): Promise<boolean> {
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const { count, error } = await supabase
    .from('report_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('pluginId', pluginId)
    .eq('ip_address', ip)
    .gte('created_at', oneDayAgo.toISOString());

  if (error) {
    console.error('[PluginReportService] Error checking rate limit:', error);
    return true; // Allow if error (fail open)
  }

  const submissionCount = count || 0;
  console.log('[PluginReportService] Rate limit check:', {
    pluginId,
    ip: `${ip.substring(0, 10)}...`,
    submissionCount,
    limit: 3,
  });

  return submissionCount < 3;
}

/**
 * Record a report submission (for rate limiting)
 */
async function recordReportSubmission(pluginId: string, ip: string): Promise<void> {
  await supabase.from('report_submissions').insert([
    {
      pluginId,
      ip_address: ip,
      created_at: new Date().toISOString(),
    },
  ]);
}

/**
 * Get client IP address (approximation)
 * Note: This is a client-side approximation and can be spoofed
 * For production, use server-side IP detection
 */
async function getClientIP(): Promise<string> {
  try {
    // Try to get IP from external service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('[PluginReportService] Could not get IP, using fallback');
    // Fallback: use a hash of user agent + timestamp
    const ua = navigator.userAgent;
    const hash = await hashString(ua + Date.now().toString());
    return `anon-${hash.substring(0, 8)}`;
  }
}

/**
 * Simple hash function for anonymization
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get reports that need attention (for admin badge)
 */
export async function getReportsNeedingAttention(): Promise<number> {
  const { count, error } = await supabase
    .from('plugin_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('[PluginReportService] Error counting pending reports:', error);
    return 0;
  }

  return count || 0;
}

export default {
  submitPluginReport,
  getPluginReports,
  getPendingReportCount,
  getReportCounts,
  getAllReports,
  updateReportStatus,
  deleteReport,
  getReportsNeedingAttention,
};
