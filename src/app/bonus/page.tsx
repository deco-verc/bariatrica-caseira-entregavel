'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { BookOpen, Download, Lock, CheckCircle2, ChevronLeft, FileText, Smartphone, X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';

export default function BonusPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };
    loadData();
  }, [router, supabase]);

  const bonusItems = [
    {
      id: 1,
      title: "Saúde Intestinal",
      desc: "Protocolo prático para ajudar a destravar o intestino em 7 dias, com hidratação, fibras e rotina simples.",
      type: "Guia PDF",
      status: "liberado",
      icon: <FileText className="w-8 h-8 text-green-500" />,
      pdfUrl: "https://drive.google.com/file/d/1P5dOJuSJuivu0zvxvBeWLAFr616g2Lo6/preview"
    },
    {
      id: 2,
      title: "Anti-Compulsão",
      desc: "Guia prático para identificar gatilhos emocionais e usar técnicas SOS nos momentos de vontade fora de hora.",
      type: "Treinamento",
      status: "liberado",
      icon: <CheckCircle2 className="w-8 h-8 text-blue-500" />,
      pdfUrl: "https://drive.google.com/file/d/1jKDNsZOX5BHXYUQxfjUmimFy7cIQqK6l/preview"
    },
    {
      id: 3,
      title: "100 Receitas Seca-Barriga",
      desc: "Livro com receitas práticas, saudáveis e de baixa caloria para facilitar a rotina alimentar.",
      type: "E-book PDF",
      status: "liberado",
      icon: <BookOpen className="w-8 h-8 text-orange-500" />,
      pdfUrl: "https://drive.google.com/file/d/1KvCRrandZZMGmSW5vgjSVJ0wEBg0tyRZ/preview"
    },
    {
      id: 4,
      title: "Acompanhador de Medidas",
      desc: "Diário de evolução corporal por 8 semanas para registrar peso, cintura, abdômen e outras medidas.",
      type: "Ferramenta",
      status: "liberado",
      icon: <Smartphone className="w-8 h-8 text-indigo-500" />,
      pdfUrl: "https://drive.google.com/file/d/1AmyDWOf01V6NVoQ6yp4o9lZzAF_jm9YV/preview"
    }
  ];

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Header title="Biblioteca de Bônus" />

      <div className="max-w-6xl mx-auto p-6 space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Seus Materiais Exclusivos</h2>
          <p className="text-gray-500">Aproveite todo o conteúdo que preparamos para potencializar seus resultados.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {bonusItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-premium h-full flex flex-col md:flex-row group"
            >
              <div className="md:w-32 bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 group-hover:bg-primary-very-light transition-colors">
                {item.status === 'liberado' ? item.icon : <Lock className="w-8 h-8 text-gray-300" />}
              </div>
              
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${item.status === 'liberado' ? 'bg-primary-very-light text-primary' : 'bg-gray-100 text-gray-400'}`}>
                    {item.status === 'liberado' ? 'Liberado' : 'Bloqueado'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{item.type}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1 italic">"{item.desc}"</p>
                
                <div className="flex gap-3">
                  {item.title === "Acompanhador de Medidas" ? (
                    <button 
                      onClick={() => router.push('/medidas')}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      Acessar Agora
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setSelectedPdf(item.pdfUrl || null)}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        Visualizar
                      </button>
                      <a 
                        href={item.pdfUrl?.replace('/preview', '/view')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-outline py-2 px-4 border shadow-sm flex items-center justify-center"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upsell Teasing */}
        <div className="card-premium p-10 bg-gray-900 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-bold mb-4">Protocolo Avançado de Queima</h3>
            <p className="text-white/80 mb-8 text-lg">
              Desbloqueie o acesso à Etapa 2, incluindo os Ingredientes Bloqueados da sua fórmula e 3 novos bônus exclusivos para quem quer emagrecer mais de 10kg.
            </p>
            <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              Quero saber mais sobre o Protocolo Avançado
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Visualização de PDF */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80"
            onClick={() => setSelectedPdf(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden relative z-10 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Visualizando Material</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={selectedPdf.replace('/preview', '/view')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedPdf(null)}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe 
                src={selectedPdf}
                className="w-full h-full border-none"
                allow="autoplay"
              />
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
