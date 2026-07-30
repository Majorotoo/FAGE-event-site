'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Download, 
  LogOut, 
  Monitor, 
  Smartphone, 
  Tablet,
  Search,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { isAuthenticated, logout } from '@/lib/auth';
import { DeviceInfo } from '@/lib/device';
import { supabase } from '@/lib/supabase';

interface Participant {
  id: number;
  firstName: string;
  surname: string;
  telephone: string;
  email: string;
  association: string;
  registeredAt: string;
  deviceInfo: DeviceInfo;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Load participants from Supabase
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('registered_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching participants:', error);
      } else if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          surname: p.surname,
          telephone: p.telephone,
          email: p.email || 'N/A',
          association: p.association || 'N/A',
          registeredAt: new Date(p.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deviceInfo: p.device_info || {
            userAgent: 'Unknown',
            platform: 'Unknown',
            browser: 'Unknown',
            deviceType: 'desktop',
            screenResolution: 'Unknown'
          }
        }));
        setParticipants(mapped);
      }
      setIsLoading(false);
    };
    
    fetchParticipants();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      // Delete from Supabase
      const { error } = await supabase.from('participants').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting participant:', error);
      } else {
        setParticipants(participants.filter(p => p.id !== id));
      }
    }
  };

  const handleExport = () => {
    if (participants.length === 0) return;

    const excelData = participants.map((p, index) => ({
      'No.': index + 1,
      'First Name': p.firstName,
      'Surname': p.surname,
      'Telephone': p.telephone,
      'Email': p.email,
      'Association / Organization': p.association,
      'Time Registered': p.registeredAt,
      'Device': `${p.deviceInfo.browser} on ${p.deviceInfo.platform}`,
      'Device Type': p.deviceInfo.deviceType,
      'Screen Resolution': p.deviceInfo.screenResolution
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    const max_widths = [
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 18 }
    ];
    worksheet['!cols'] = max_widths;

    const fileName = `OmniBSIC_Event_Registration_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const filteredParticipants = participants.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(searchLower) ||
      p.surname.toLowerCase().includes(searchLower) ||
      p.telephone.includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      p.association.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-amber-500/10 blur-[130px] pointer-events-none rounded-full animate-glow" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto pt-6 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Back to registration"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">OmniBSIC Bank Roundtable Discussion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={participants.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/40"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-950/40"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex-1">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Participants</p>
                <p className="text-3xl font-bold text-white">{participants.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/30">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Mobile Users</p>
                <p className="text-3xl font-bold text-white">
                  {participants.filter(p => p.deviceInfo.deviceType === 'mobile').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                <Smartphone className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Desktop Users</p>
                <p className="text-3xl font-bold text-white">
                  {participants.filter(p => p.deviceInfo.deviceType === 'desktop').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30">
                <Monitor className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search participants by name, phone, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-12 pr-4 py-4 rounded-xl outline-none text-sm placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Device</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No participants found</p>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white text-sm">
                          {p.firstName} {p.surname}
                        </p>
                        <p className="text-xs text-slate-500">ID: {p.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{p.telephone}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{p.association}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${
                            p.deviceInfo.deviceType === 'mobile' ? 'bg-emerald-950/50 text-emerald-400' :
                            p.deviceInfo.deviceType === 'tablet' ? 'bg-blue-950/50 text-blue-400' :
                            'bg-amber-950/50 text-amber-400'
                          }`}>
                            {getDeviceIcon(p.deviceInfo.deviceType)}
                          </span>
                          <div>
                            <p className="text-xs text-slate-300">{p.deviceInfo.browser}</p>
                            <p className="text-[10px] text-slate-500">{p.deviceInfo.platform}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{p.registeredAt}</p>
                        <p className="text-[10px] text-slate-500">{p.deviceInfo.screenResolution}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                          title="Delete participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-600 border-t border-slate-900">
        &copy; {new Date().getFullYear()} OmniBSIC Bank. Admin Dashboard.
      </footer>
    </div>
  );
}
