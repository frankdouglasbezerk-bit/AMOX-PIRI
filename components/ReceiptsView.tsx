
import React, { useState } from 'react';
import { ReceiptText, Search, Printer, ArrowLeft, ShieldCheck, Calendar, Trash2, Download, FileText, User as UserIcon, FileCheck, Share2 } from 'lucide-react';
import { MovementRecord, User as UserType } from '../types';

interface ReceiptsViewProps {
  history: MovementRecord[];
  setHistory?: React.Dispatch<React.SetStateAction<MovementRecord[]>>;
  user?: UserType;
}

interface GroupedReceipt {
  batchId: string;
  date: string;
  recipient: string;
  userId: string;
  items: MovementRecord[];
}

const ReceiptsView: React.FC<ReceiptsViewProps> = ({ history, setHistory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Filtra saídas e agrupa por batchId (Protocolo)
  const exits = history.filter(h => h.type === 'Saída');
  
  const groupedReceipts = exits.reduce((acc, record) => {
    const key = record.batchId || record.id;
    if (!acc[key]) {
      acc[key] = {
        batchId: key,
        date: record.date,
        recipient: record.recipient || 'NÃO INFORMADO',
        userId: record.userId,
        items: []
      };
    }
    acc[key].items.push(record);
    return acc;
  }, {} as Record<string, GroupedReceipt>);

  // Fixed Error: Type 'unknown[]' is not assignable to type 'GroupedReceipt[]'.
  const receiptList: GroupedReceipt[] = (Object.values(groupedReceipts) as GroupedReceipt[]).reverse();

  const filteredReceipts = receiptList.filter(r => 
    r.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.items.some(i => i.material.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeReceipt = selectedBatchId ? groupedReceipts[selectedBatchId] : null;

  const handlePrintAction = () => {
    window.print();
  };

  const handleDeleteBatch = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.role !== 'admin') {
      alert("ACESSO NEGADO: Apenas administradores podem excluir registros de recibos.");
      return;
    }
    
    const password = prompt("AUTENTICAÇÃO DE SEGURANÇA:\nDigite a SENHA DO ADM para apagar este recibo:");
    
    if (password === '12345678910') {
      if (confirm('AVISO: Esta ação é permanente. Deseja excluir este recibo do histórico?')) {
        if (setHistory) {
          setHistory(prev => prev.filter(record => (record.batchId || record.id) !== batchId));
          if (selectedBatchId === batchId) setSelectedBatchId(null);
        }
      }
    } else if (password !== null) {
      alert("SENHA INCORRETA! Operação cancelada.");
    }
  };

  // TELA DE DOCUMENTO (REDIRECIONAMENTO INTERNO)
  if (activeReceipt) {
    return (
      <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-fadeIn select-none">
        <style>
          {`
            @media print {
              .no-print { display: none !important; }
              .print-only { display: block !important; }
              body { margin: 0; padding: 0; background: white; }
              .receipt-page { 
                width: 100%; 
                margin: 0; 
                padding: 40px;
                box-shadow: none;
                border: none;
              }
            }
          `}
        </style>

        {/* Header de Controle (Oculto na Impressão) */}
        <div className="no-print bg-[#0f1115] border-b border-white/10 p-4 sticky top-0 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <button 
            onClick={() => setSelectedBatchId(null)}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-white hover:text-amber-500 transition-all bg-white/5 px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={16} /> Voltar para Listagem
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrintAction}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
            >
              <Download size={18} /> Baixar PDF / Imprimir
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10"
            >
              <Printer size={18} /> Imprimir Cópia
            </button>
          </div>
        </div>

        {/* Página do Recibo (Layout A4) */}
        <div className="receipt-page bg-white max-w-4xl mx-auto my-8 p-12 md:p-20 shadow-2xl border-t-[16px] border-amber-600 text-slate-900 font-sans min-h-[1123px]">
          
          {/* Cabeçalho Profissional */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-12 mb-12 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-white">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-slate-900">AMOX SUB PIRI</h1>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2">Almoxarifado Subestação Piripiri</p>
                </div>
              </div>
            </div>
            
            <div className="text-left md:text-right bg-slate-50 p-6 border-2 border-slate-200 rounded-3xl min-w-[240px]">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Protocolo de Saída</span>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">#{activeReceipt.batchId}</span>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[10px] font-bold text-slate-600 uppercase">Data de Emissão</p>
                <p className="text-sm font-black text-slate-900">{activeReceipt.date}</p>
              </div>
            </div>
          </div>

          {/* Título do Documento */}
          <div className="bg-slate-900 text-white text-center py-4 mb-12">
            <h2 className="text-xl font-black uppercase tracking-[0.5em]">Guia de Retirada de Material</h2>
          </div>

          {/* Dados do Recebedor */}
          <div className="bg-amber-50 border-l-[10px] border-amber-500 p-10 mb-12 space-y-6">
            <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Informações do Destinatário</h3>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-600 uppercase mb-1">Recebedor Autorizado</p>
                <p className="text-xl font-black text-slate-900 uppercase underline decoration-4 decoration-amber-500 underline-offset-8">
                  {activeReceipt.recipient}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-600 uppercase mb-1">Almoxarife Responsável</p>
                <p className="text-xl font-black text-slate-900 uppercase">
                  {activeReceipt.userId}
                </p>
              </div>
            </div>
          </div>

          {/* Tabela de Materiais */}
          <div className="mb-16 border-4 border-slate-900 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Código SAP</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Descrição do Item</th>
                  <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900">
                {activeReceipt.items.map((item) => (
                  <tr key={item.id} className="text-sm font-bold uppercase text-slate-900">
                    <td className="p-5 font-mono text-slate-600 border-r-2 border-slate-900">{item.sap}</td>
                    <td className="p-5 border-r-2 border-slate-900">{item.material}</td>
                    <td className="p-5 text-right font-black text-lg">{item.quantity} UN</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr>
                  <td colSpan={2} className="p-6 text-[11px] font-black uppercase text-right border-r-2 border-slate-900 text-slate-700">Total de Itens Entregues:</td>
                  <td className="p-6 text-right font-black text-2xl text-slate-900">
                    {activeReceipt.items.reduce((acc, i) => acc + i.quantity, 0)} UN
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Campo de Assinatura */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="text-center space-y-4">
              <div className="border-t-2 border-slate-900 w-full mb-4"></div>
              <p className="text-xs font-black uppercase text-slate-900">{activeReceipt.recipient}</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Assinatura do Recebedor</p>
            </div>
            <div className="text-center space-y-4">
              <div className="border-t-2 border-slate-900 w-full mb-4"></div>
              <p className="text-xs font-black uppercase text-slate-900">{activeReceipt.userId}</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Responsável pela Entrega</p>
            </div>
          </div>

          {/* Rodapé do Documento */}
          <div className="mt-auto pt-20 border-t border-slate-200 flex flex-col items-center gap-6">
            <div className="flex gap-8 text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">
              <span>VIA DO ALMOXARIFADO</span>
              <span>•</span>
              <span>SISTEMA AMOX PIRI</span>
              <span>•</span>
              <span>PIRIPIRI - PI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">BY: DOUG</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LISTAGEM DE RECIBOS (ABA PRINCIPAL)
  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Central de Recibos</h1>
          <p className="text-slate-400 font-medium text-sm">Visualize, imprima ou baixe comprovantes de todas as saídas registradas.</p>
        </div>
        
        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por recebedor ou protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-[#161a21] border border-white/10 rounded-[2rem] text-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-sm shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredReceipts.length > 0 ? (
          filteredReceipts.map((receipt) => (
            <div
              key={receipt.batchId}
              onClick={() => setSelectedBatchId(receipt.batchId)}
              className="bg-[#161a21] p-10 rounded-[3rem] border border-white/10 hover:border-amber-500/40 transition-all group cursor-pointer relative overflow-hidden shadow-2xl hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 group-hover:text-amber-500 transition-all">
                <FileCheck size={40} />
              </div>

              <div className="flex justify-between items-start mb-10">
                <div className="bg-amber-600 p-4 rounded-2xl shadow-lg shadow-amber-900/20 text-white">
                  <ReceiptText size={28} />
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={(e) => handleDeleteBatch(receipt.batchId, e)}
                    className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Excluir Recibo"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Destinatário / Equipe</span>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight truncate leading-none">
                    {receipt.recipient}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Protocolo</span>
                    <p className="text-amber-500 font-mono text-xs font-black">#{receipt.batchId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Data</span>
                    <p className="text-slate-300 text-xs font-bold">{receipt.date.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-6">
                   <div className="flex items-center gap-2 text-slate-300 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                      <FileText size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{receipt.items.length} Itens</span>
                   </div>
                   <div className="text-amber-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                      Abrir Guia <ArrowLeft size={14} className="rotate-180" />
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-56 text-center">
            <div className="bg-white/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ReceiptText size={64} className="text-slate-700" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest opacity-40">Base de Recibos Vazia</h2>
            <p className="text-slate-500 text-[10px] font-bold mt-4 uppercase tracking-[0.3em] opacity-40">Nenhuma saída de lote foi registrada até o momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsView;
