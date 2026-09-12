import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ---- Buttons ---------------------------------------------------------------
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
};
export function Button({ variant = 'primary', loading, children, className = '', disabled, ...rest }: BtnProps) {
  const cls =
    variant === 'primary' ? 'btn btn-primary'
    : variant === 'danger' ? 'btn' : 'btn btn-ghost';
  const style = variant === 'danger' ? { background: '#ef4444', color: '#fff' } : undefined;
  return (
    <button className={`${cls} ${className}`} style={style} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}

// ---- Form fields -----------------------------------------------------------
const FieldId = createContext<string | undefined>(undefined);
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <FieldId.Provider value={id}>{children}</FieldId.Provider>
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useContext(FieldId);
  return <input className="input" id={id} {...props} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useContext(FieldId);
  return <textarea className="textarea" id={id} {...props} />;
}
export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useContext(FieldId);
  return <select className="select" id={id} {...rest}>{children}</select>;
}

// ---- Tag / string[] input --------------------------------------------------
export function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const fieldId = useContext(FieldId);
  const commit = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className="tag-input">
      <div className="tag-chips">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="tag-chip">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
      <input
        id={fieldId} className="input" value={draft} placeholder={placeholder ?? 'Type and press Enter'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
          else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
      />
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} disabled={disabled} aria-label={label || 'Visibility'} onChange={(e) => onChange(e.target.checked)} />
      <span className="track"><span className="thumb" /></span>
      {label ? <span style={{ fontSize: '0.9rem' }}>{label}</span> : null}
    </label>
  );
}

// ---- Toasts ----------------------------------------------------------------
type Toast = { id: number; kind: 'success' | 'error'; msg: string };
const ToastCtx = createContext<{ push: (kind: Toast['kind'], msg: string) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {createPortal(<div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          <span className="admin-toast-icon">{t.kind === 'success' ? <Check size={20} /> : <CircleAlert size={20} />}</span><span>{t.msg}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToasts(xs => xs.filter(x => x.id !== t.id))}><X size={16} /></button>
        </div>)}
      </div>, [...document.querySelectorAll('dialog[open]')].at(-1) ?? document.body)}
    </ToastCtx.Provider>
  );
}

// ---- Confirm dialog --------------------------------------------------------
export function useConfirm() {
  return useCallback((message: string) => window.confirm(message), []);
}

// ---- Modal -----------------------------------------------------------------
export function Modal({ title, onClose, children, footer, wide }: {
  title: string; onClose: () => void; children: React.ReactNode;
  footer?: React.ReactNode; wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { node?.close(); document.body.style.overflow = previous; };
  }, []);
  return (
    <dialog ref={dialog} className="modal-overlay" aria-label={title} onCancel={e => { e.preventDefault(); e.stopPropagation(); onClose(); }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal card ${wide ? 'modal-wide' : ''}`}>
        <div className="modal-head">
          <strong>{title}</strong>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </dialog>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty card">{children}</div>;
}

export function Spinner() { return <span className="spinner" aria-label="loading" />; }
