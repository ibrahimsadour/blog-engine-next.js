'use client';

import { Check, Link as LinkIcon } from 'lucide-react';
import { isInternalContentLink } from '@/lib/content-links';

interface LinkSettingsModalProps {
  url: string;
  rel: string;
  openInNewTab: boolean;
  onUrlChange: (value: string) => void;
  onRelChange: (value: string) => void;
  onTargetChange: (value: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function LinkSettingsModal(props: LinkSettingsModalProps) {
  const internal = isInternalContentLink(props.url);
  const selectedRel = internal ? 'dofollow' : props.rel;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="dir-rtl w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <LinkIcon size={18} className="text-blue-600" /><span>إعدادات الرابط للسيو</span>
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">رابط الـ URL (داخلي أو خارجي):</label>
            <input type="text" value={props.url} onChange={(event) => props.onUrlChange(event.target.value)} placeholder="https://example.com أو /category/services" className="dir-ltr w-full rounded-lg border border-slate-300 p-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">نوع الرابط لمحركات البحث (SEO):</label>
            <div className="grid grid-cols-2 gap-2">
              {['dofollow', 'nofollow'].map((value) => (
                <button key={value} type="button" disabled={internal && value === 'nofollow'} onClick={() => props.onRelChange(value)} className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${selectedRel === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                  {selectedRel === value && <Check size={14} />}<span>{value === 'dofollow' ? 'رابط عادي (Follow)' : 'Nofollow'}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="linkTargetCheckbox" disabled={internal} checked={!internal && props.openInNewTab} onChange={(event) => props.onTargetChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="linkTargetCheckbox" className="cursor-pointer text-xs font-medium text-slate-700">فتح الرابط في تبويب جديد (<code>target=&quot;_blank&quot;</code>)</label>
          </div>
          {internal && <p className="text-xs text-slate-500">الروابط الداخلية تفتح في الصفحة نفسها دون nofollow. يمكن اختيار nofollow يدويا للروابط الخارجية.</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={props.onCancel} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">إلغاء</button>
          <button type="button" onClick={props.onSave} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-700">حفظ الرابط</button>
        </div>
      </div>
    </div>
  );
}
