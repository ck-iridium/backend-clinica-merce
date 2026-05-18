import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function TemplatesCatalog({
  templates,
  getServiceName,
  handleDeleteTemplate
}: {
  templates: any[];
  getServiceName: (id: string) => string;
  handleDeleteTemplate: (id: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-stone-700 ml-1">{t('dashboard.vouchers.configured_models') || 'Modelos de bonos configurados'}</h2>
      </div>
      
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] uppercase tracking-[0.15em] font-black text-stone-400">
                  <th className="px-8 py-5">{t('dashboard.vouchers.table_template_name') || 'Nombre de la Plantilla'}</th>
                  <th className="px-8 py-5">{t('dashboard.vouchers.table_valid_service') || 'Tratamiento Válido'}</th>
                  <th className="px-8 py-5 text-center">{t('dashboard.vouchers.table_sessions_count') || 'Nº Sesiones'}</th>
                  <th className="px-8 py-5">{t('dashboard.vouchers.table_suggested_price') || 'Precio Sugerido'}</th>
                  <th className="px-8 py-5 text-right">{t('dashboard.vouchers.table_actions') || 'Acciones'}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
               {templates.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-stone-400 font-bold">{t('dashboard.vouchers.empty_catalog') || 'El catálogo está vacío. Crea tu primer bono base.'}</td></tr>
               ) : templates.map(tpl => (
                  <tr key={tpl.id} className="hover:bg-stone-50/80 transition-colors group">
                     <td className="px-8 py-6 font-extrabold text-stone-900">{tpl.name}</td>
                     <td className="px-8 py-6 font-medium text-stone-500 text-sm">{getServiceName(tpl.service_id)}</td>
                     <td className="px-8 py-6 text-center">
                        <span className="inline-block bg-primary/5 text-primary font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">
                          {(t('dashboard.vouchers.sessions_plural') || '{sessions} sesiones').replace('{sessions}', tpl.total_sessions.toString())}
                        </span>
                     </td>
                     <td className="px-8 py-6 font-black text-stone-900">{tpl.price} €</td>
                     <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-all ml-auto opacity-0 group-hover:opacity-100 active:scale-95 shadow-sm"
                          title={t('dashboard.vouchers.delete_template_title') || "Eliminar plantilla"}
                        >
                          <span className="text-xl leading-none">×</span>
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </>
  );
}
