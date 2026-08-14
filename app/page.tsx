'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Download, 
  CheckCircle2, 
  UserPlus, 
  ShieldCheck, 
  Trash2,
  Users,
  Pencil,
  X
} from 'lucide-react';
import { getDeviceInfo, DeviceInfo } from '@/lib/device';
import { getSupabase } from '@/lib/supabase';

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

export default function OnSpotRegistration() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    telephone: '',
    email: '',
    association: ''
  });

  // Load participants from Supabase on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      const supabase = getSupabase();
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
    };
    
    fetchParticipants();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.surname.trim() || !formData.telephone.trim()) {
      return;
    }

    if (isEditing && editingId !== null) {
      // Update existing participant in Supabase
      const supabase = getSupabase();
      (supabase.from('participants') as any).update({
        first_name: formData.firstName.trim(),
        surname: formData.surname.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim() || null,
        association: formData.association.trim() || null
      }).eq('id', editingId).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Error updating participant in Supabase:', error);
        }
      });

      // Update local state
      setParticipants(participants.map(p => 
        p.id === editingId 
          ? {
              ...p,
              firstName: formData.firstName.trim(),
              surname: formData.surname.trim(),
              telephone: formData.telephone.trim(),
              email: formData.email.trim() || 'N/A',
              association: formData.association.trim() || 'N/A'
            }
          : p
      ));
      setIsEditing(false);
      setEditingId(null);
    } else {
      const deviceInfo = getDeviceInfo();
      // Add new participant
      const newParticipant: Participant = {
        id: participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1,
        firstName: formData.firstName.trim(),
        surname: formData.surname.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim() || 'N/A',
        association: formData.association.trim() || 'N/A',
        registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceInfo: deviceInfo
      };

      setParticipants([newParticipant, ...participants]);

      // Save to Supabase
      const supabase = getSupabase();
      (supabase.from('participants') as any).insert({
        first_name: formData.firstName.trim(),
        surname: formData.surname.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim() || null,
        association: formData.association.trim() || null,
        device_info: deviceInfo,
        registered_at: new Date().toISOString()
      }).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      });
    }
    
    // Clear form & show success badge
    setFormData({
      firstName: '',
      surname: '',
      telephone: '',
      email: '',
      association: ''
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };
  
  // Export data array to Excel (.xlsx)
  const exportToExcel = () => {
    if (participants.length === 0) return;

    // Map data into clean Excel column headers
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

    // Auto-fit column widths
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

    // Trigger download
    const fileName = `COLEAD_Event_Registration_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const clearList = async () => {
    if (confirm('Are you sure you want to clear all registered participants?')) {
      // Delete all from Supabase
      const supabase = getSupabase();
      const { error } = await supabase.from('participants').delete().neq('id', 0);
      
      if (error) {
        console.error('Error clearing participants:', error);
      } else {
        setParticipants([]);
      }
    }
  };

  const deleteParticipant = async (id: number) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      // Delete from Supabase
      const supabase = getSupabase();
      const { error } = await supabase.from('participants').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting participant:', error);
      } else {
        setParticipants(participants.filter(p => p.id !== id));
        // If deleting the currently edited participant, cancel edit mode
        if (editingId === id) {
          cancelEdit();
        }
      }
    }
  };

  const startEdit = (participant: Participant) => {
    setFormData({
      firstName: participant.firstName,
      surname: participant.surname,
      telephone: participant.telephone,
      email: participant.email === 'N/A' ? '' : participant.email,
      association: participant.association === 'N/A' ? '' : participant.association
    });
    setIsEditing(true);
    setEditingId(participant.id);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      surname: '',
      telephone: '',
      email: '',
      association: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-amber-500/10 blur-[130px] pointer-events-none rounded-full animate-glow" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto pt-6 px-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 relative flex items-center justify-center shrink-0">
  <Image
    src="/FAGE Logos-02.png"
    alt="FAGE Logo"
    width={150}
    height={150}
    className="object-contain"
    priority
  />
</div>
          <span className="font-bold tracking-wider text-sm md:text-base text-slate-200 uppercase">
            FAGE <span className="text-amber-400 font-normal">Ghana Horticulture Expo Press Conference</span>
          </span>
        </div>


      </header>

      {/* Main Grid: Form + Live List */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Registration Form (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
              <UserPlus className="h-3.5 w-3.5 text-amber-400" /> {isEditing ? 'Edit Participant' : 'On-the-Spot Registration'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {isEditing ? 'Edit Participant Details' : 'Participant Desk Entry'}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {isEditing ? 'Update the participant details below.' : 'Please enter participant details below to register them for the event.'}
            </p>
            {isEditing && (
              <button
                onClick={cancelEdit}
                className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" /> Cancel Edit
              </button>
            )}
          </div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Participant successfully registered and added to list!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* First Name & Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-10 pr-3 py-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Surname <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="surname"
                    required
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="e.g. Mensah"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-10 pr-3 py-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Telephone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Telephone <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    name="telephone"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="e.g. 024XXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-10 pr-3 py-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-10 pr-3 py-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Association / Organization */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Association / Organization
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="association"
                  value={formData.association}
                  onChange={handleChange}
                  placeholder="e.g. National Mangoes Ass/ Vepeag"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 pl-10 pr-3 py-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
            >
              {isEditing ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              <span>{isEditing ? 'Update Participant' : 'Submit Registration'}</span>
            </button>
          </form>
        </div>

        {/* Registered Participants Sidebar List (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col h-[520px]">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Registered ({participants.length})</h2>
            </div>
          </div>

          {/* Scrollable Registered Attendees */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 custom-scrollbar">
            {participants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Users className="h-8 w-8 mb-2 opacity-30" />
                No participants registered yet today. Fill the form to add entries.
              </div>
            ) : (
              participants.map((p) => (
                <div 
                  key={p.id}
                  className={`bg-slate-950/80 border ${editingId === p.id ? 'border-blue-500/50' : 'border-slate-800/80'} rounded-xl p-3.5 flex items-start justify-between text-xs transition-all`}
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-200 text-sm">
                      {p.firstName} {p.surname}
                    </p>
                    <p className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-emerald-400" /> {p.telephone}
                    </p>
                    {p.association !== 'N/A' && (
                      <p className="text-amber-300/80 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-amber-400" /> {p.association}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                      {p.registeredAt}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors"
                        title="Edit participant"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteParticipant(p.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                        title="Delete participant"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Export Footer */}
          <div className="pt-4 border-t border-slate-800/80 mt-2">
            <button
              onClick={exportToExcel}
              disabled={participants.length === 0}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-medium text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Download Excel Sheet (.xlsx)
            </button>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-600 z-10 border-t border-slate-900">
        &copy; {new Date().getFullYear()} Colead. Public-Private Dialogue (PPD) Workshop Event Registration Desk.
      </footer>

    </div>
  );
}