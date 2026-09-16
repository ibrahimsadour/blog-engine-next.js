import { AlertTriangle, RotateCcw } from 'lucide-react';

interface DraftRecoveryBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}

export default function DraftRecoveryBanner({ onRestore, onDiscard }: DraftRecoveryBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 sm:text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <span>يوجد نسخة محفوظة تلقائياً لهذا المقال من جلستك السابقة، هل ترغب باستعادتها؟</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onRestore} className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700">
          <RotateCcw className="h-3.5 w-3.5" /><span>استعادة البيانات</span>
        </button>
        <button type="button" onClick={onDiscard} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">تجاهل</button>
      </div>
    </div>
  );
}
