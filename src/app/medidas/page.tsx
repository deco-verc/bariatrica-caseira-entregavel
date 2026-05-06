'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { TrendingUp, Plus, ChevronLeft, Calendar, Save, Trash2, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function measurementsPage() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    week_number: 1,
    date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    bust_cm: '',
    waist_cm: '',
    abdomen_cm: '',
    hip_cm: '',
    thigh_cm: '',
    arm_cm: '',
    energy_level: 'media',
    bloating_level: 'pouco',
    clothes_fit: 'normais',
    notes: ''
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: m } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setMember(m);

      const { data: ms } = await supabase
        .from('measurements')
        .select('*')
        .eq('member_id', m.id)
        .order('week_number', { ascending: true });
      
      setMeasurements(ms || []);
      
      // Pre-fill next week
      if (ms && ms.length > 0) {
        const lastWeek = ms[ms.length - 1].week_number;
        setFormData(prev => ({ ...prev, week_number: lastWeek + 1 }));
      }

      setLoading(false);
    };
    loadData();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('measurements')
        .insert({
          member_id: member.id,
          week_number: parseInt(formData.week_number.toString()),
          date: formData.date,
          weight_kg: parseFloat(formData.weight_kg),
          bust_cm: formData.bust_cm ? parseFloat(formData.bust_cm) : null,
          waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
          abdomen_cm: formData.abdomen_cm ? parseFloat(formData.abdomen_cm) : null,
          hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
          thigh_cm: formData.thigh_cm ? parseFloat(formData.thigh_cm) : null,
          arm_cm: formData.arm_cm ? parseFloat(formData.arm_cm) : null,
          energy_level: formData.energy_level,
          bloating_level: formData.bloating_level,
          clothes_fit: formData.clothes_fit,
          notes: formData.notes
        })
        .select()
        .single();

      if (error) throw error;

      setMeasurements([...measurements, data].sort((a, b) => a.week_number - b.week_number));
      setShowAddModal(false);
      
      // Reset form for next possible week
      setFormData(prev => ({ 
        ...prev, 
        week_number: data.week_number + 1,
        weight_kg: '',
        bust_cm: '',
        waist_cm: '',
        abdomen_cm: '',
        hip_cm: '',
        thigh_cm: '',
        arm_cm: '',
        notes: ''
      }));
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar medidas.');
    } finally {
      setSaving(false);
    }
  };

  const calculateLoss = (current: number, field: string) => {
    if (measurements.length <= 1) return null;
    const initial = measurements[0][field];
    if (!initial || !current) return null;
    const diff = current - initial;
    return diff.toFixed(1);
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Minhas Medidas" 
        rightElement={
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white p-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-6xl mx-auto p-6 space-y-10">
        {measurements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-primary-very-light rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comece sua jornada!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Registre suas medidas iniciais para que possamos acompanhar sua evolução pelas próximas 8 semanas.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Registrar Medidas Iniciais
            </button>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <SummaryCard 
                title="Peso Perdido" 
                value={calculateLoss(measurements[measurements.length-1].weight_kg, 'weight_kg')} 
                unit="kg" 
                inverse
              />
              <SummaryCard 
                title="Cintura" 
                value={calculateLoss(measurements[measurements.length-1].waist_cm, 'waist_cm')} 
                unit="cm" 
                inverse
              />
              <SummaryCard 
                title="Abdômen" 
                value={calculateLoss(measurements[measurements.length-1].abdomen_cm, 'abdomen_cm')} 
                unit="cm" 
                inverse
              />
            </div>

            {/* measurements List */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Histórico de Semanas</h3>
              <div className="grid gap-4">
                {measurements.map((m) => (
                  <div key={m.id} className="card-premium p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-white rounded-xl flex flex-col items-center justify-center font-bold">
                          <span className="text-[10px] opacity-70">SEM</span>
                          <span>{m.week_number}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(m.date), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <p className="font-bold text-gray-900 text-lg">{m.weight_kg} kg</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                        <MeasureSmall label="Cintura" value={m.waist_cm} />
                        <MeasureSmall label="Abdômen" value={m.abdomen_cm} />
                        <MeasureSmall label="Quadril" value={m.hip_cm} />
                        <MeasureSmall label="Busto" value={m.bust_cm} />
                        <MeasureSmall label="Coxa" value={m.thigh_cm} />
                        <MeasureSmall label="Braço" value={m.arm_cm} />
                      </div>
                    </div>
                    {(m.energy_level || m.bloating_level || m.notes) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                        <span className="bg-white px-3 py-1 rounded-full border">Energia: <span className="text-primary">{m.energy_level}</span></span>
                        <span className="bg-white px-3 py-1 rounded-full border">Inchaço: <span className="text-orange-500">{m.bloating_level}</span></span>
                        <span className="bg-white px-3 py-1 rounded-full border">Roupas: <span className="text-blue-500">{m.clothes_fit}</span></span>
                        {m.notes && <p className="w-full mt-2 text-gray-400 italic">" {m.notes} "</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Registrar Semana {formData.week_number}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSave} className="overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)*</label>
                    <input 
                      type="number" step="0.1" required
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                      className="form-input" placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Medidas (opcional)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <MeasureInput label="Cintura (cm)" field="waist_cm" val={formData.waist_cm} set={setFormData} />
                    <MeasureInput label="Abdômen (cm)" field="abdomen_cm" val={formData.abdomen_cm} set={setFormData} />
                    <MeasureInput label="Quadril (cm)" field="hip_cm" val={formData.hip_cm} set={setFormData} />
                    <MeasureInput label="Busto (cm)" field="bust_cm" val={formData.bust_cm} set={setFormData} />
                    <MeasureInput label="Coxa (cm)" field="thigh_cm" val={formData.thigh_cm} set={setFormData} />
                    <MeasureInput label="Braço (cm)" field="arm_cm" val={formData.arm_cm} set={setFormData} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900">Como você se sente?</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <SelectField 
                      label="Nível de Energia" 
                      value={formData.energy_level} 
                      onChange={(v) => setFormData({...formData, energy_level: v})}
                      options={[{v: 'baixa', l: 'Baixa'}, {v: 'media', l: 'Média'}, {v: 'alta', l: 'Alta'}]}
                    />
                    <SelectField 
                      label="Nível de Inchaço" 
                      value={formData.bloating_level} 
                      onChange={(v) => setFormData({...formData, bloating_level: v})}
                      options={[{v: 'muito', l: 'Muito'}, {v: 'pouco', l: 'Pouco'}, {v: 'nenhum', l: 'Nenhum'}]}
                    />
                    <SelectField 
                      label="Ajuste das Roupas" 
                      value={formData.clothes_fit} 
                      onChange={(v) => setFormData({...formData, clothes_fit: v})}
                      options={[{v: 'apertadas', l: 'Apertadas'}, {v: 'normais', l: 'Normais'}, {v: 'folgadas', l: 'Folgadas'}]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações / Como foi sua semana?</label>
                  <textarea 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-input resize-none"
                    placeholder="Ex: Tive TPM, comi um pouco mais de doce..."
                  />
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline flex-1"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary flex-1 shadow-xl shadow-green-100"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Medidas'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SummaryCard({ title, value, unit, inverse }: { title: string, value: string | null, unit: string, inverse?: boolean }) {
  const isLoss = value && parseFloat(value) < 0;
  const isGain = value && parseFloat(value) > 0;
  
  return (
    <div className="card-premium p-6">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${value ? 'text-gray-900' : 'text-gray-300'}`}>
          {value ? (parseFloat(value) > 0 ? `+${value}` : value) : '--'}
        </span>
        <span className="text-sm font-bold text-gray-400 capitalize">{unit}</span>
      </div>
      {value && (
        <p className={`text-[10px] font-bold mt-2 uppercase ${inverse ? (isLoss ? 'text-green-500' : 'text-red-500') : (isLoss ? 'text-red-500' : 'text-green-500')}`}>
          {isLoss ? 'Eliminado' : (isGain ? 'Ganhos' : 'Sem mudança')}
        </p>
      )}
    </div>
  );
}

function MeasureSmall({ label, value }: { label: string, value: number | null }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{label}</p>
      <p className={`text-sm font-bold ${value ? 'text-gray-900' : 'text-gray-200'}`}>{value || '--'}<span className="text-[10px] ml-0.5">cm</span></p>
    </div>
  );
}

function MeasureInput({ label, field, val, set }: { label: string, field: string, val: any, set: any }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
      <input 
        type="number" step="0.1"
        value={val}
        onChange={(e) => set((prev: any) => ({ ...prev, [field]: e.target.value }))}
        className="form-input text-sm p-3"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: {v: string, l: string}[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
              value === opt.v ? 'bg-primary border-primary text-white shadow-lg shadow-green-100' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

import { Ruler as RulerIcon } from 'lucide-react';
function Ruler(props: any) { return <RulerIcon {...props} /> }
