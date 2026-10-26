import React, { useState, useRef, useEffect, useId } from 'react';
import { COUNTRY_CODES, MONTHS, EDUCATION_YEARS } from '../data/constants';
import { fileSize } from '../utils/helpers';

/* ------------------------------------------------------------------ help */

export function Help({ text }) {
  return (
    <span className="help" tabIndex={0} role="note" aria-label={text}>
      ?<span className="help-text">{text}</span>
    </span>
  );
}

/* ---------------------------------------------------------------- shell */

export function Field({ label, required, hint, error, span = 6, htmlFor, tip, children }) {
  return (
    <div className={`field span-${span}`}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="required">*</span>}
          {tip && <Help text={tip} />}
        </label>
      )}
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------- text input */

export function TextInput({ label, required, hint, error, span, tip, value, onChange, placeholder, type = 'text', ...rest }) {
  const id = useId();
  return (
    <Field label={label} required={required} hint={hint} error={error} span={span} tip={tip} htmlFor={id}>
      <input
        id={id}
        type={type}
        className={`input${error ? ' is-invalid' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </Field>
  );
}

export function TextArea({ label, required, hint, error, span = 12, tip, value, onChange, placeholder, rows = 3, disabled }) {
  const id = useId();
  return (
    <Field label={label} required={required} hint={hint} error={error} span={span} tip={tip} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        className={`textarea${error ? ' is-invalid' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectInput({ label, required, hint, error, span, tip, value, onChange, options, placeholder = 'Select', disabled }) {
  const id = useId();
  return (
    <Field label={label} required={required} hint={hint} error={error} span={span} tip={tip} htmlFor={id}>
      <select
        id={id}
        disabled={disabled}
        className={`select${error ? ' is-invalid' : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

export function DateInput({ label, required, hint, error, span, tip, value, onChange, min, max }) {
  const id = useId();
  return (
    <Field label={label} required={required} hint={hint} error={error} span={span} tip={tip} htmlFor={id}>
      <input
        id={id}
        type="date"
        min={min}
        max={max}
        className={`input${error ? ' is-invalid' : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function YearSelect({ label, required, hint, error, span = 4, tip, value, onChange, years = EDUCATION_YEARS, disabled }) {
  return (
    <SelectInput
      label={label} required={required} hint={hint} error={error} span={span} tip={tip}
      value={value} onChange={onChange} options={years} placeholder="Select year" disabled={disabled}
    />
  );
}

export function MonthYearInput({ label, required, hint, error, span = 6, month, year, onMonth, onYear }) {
  return (
    <div className={`field span-${span}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="field-row">
        <select className={`select${error ? ' is-invalid' : ''}`} value={month ?? ''} onChange={(e) => onMonth(e.target.value)} aria-label="Month">
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className={`select${error ? ' is-invalid' : ''}`} value={year ?? ''} onChange={(e) => onYear(e.target.value)} aria-label="Year">
          <option value="">Year</option>
          {EDUCATION_YEARS.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function MoneyInput({ label, required, hint, error, span = 4, tip, value, onChange, placeholder = '0' }) {
  const id = useId();
  return (
    <Field label={label} required={required} hint={hint} error={error} span={span} tip={tip} htmlFor={id}>
      <div className="money-wrap">
        <span className="money-symbol">₹</span>
        <input
          id={id}
          inputMode="numeric"
          className={`input${error ? ' is-invalid' : ''}`}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
        />
      </div>
    </Field>
  );
}

export function PhoneInput({ label, required, hint, error, span = 6, code, number, onCode, onNumber }) {
  const id = useId();
  return (
    <div className={`field span-${span}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="field-row">
        <select className="select code-select" value={code} onChange={(e) => onCode(e.target.value)} aria-label="Country code">
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>{c.code} {c.label}</option>
          ))}
        </select>
        <input
          id={id}
          inputMode="tel"
          className={`input${error ? ' is-invalid' : ''}`}
          value={number ?? ''}
          placeholder="98765 43210"
          onChange={(e) => onNumber(e.target.value.replace(/[^\d\s]/g, ''))}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------ radio group */

export function RadioGroup({ label, required, hint, error, span = 6, tip, value, onChange, options }) {
  const name = useId();
  return (
    <div className={`field span-${span}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
        {tip && <Help text={tip} />}
      </label>
      <div className="choice-group" role="radiogroup">
        {options.map((o) => (
          <label key={o} className={`choice${value === o ? ' is-on' : ''}`}>
            <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
            {o}
          </label>
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function CheckboxGroup({ label, required, hint, error, span = 12, tip, values = [], onChange, options }) {
  const toggle = (o) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  return (
    <div className={`field span-${span}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
        {tip && <Help text={tip} />}
      </label>
      <div className="choice-grid">
        {options.map((o) => (
          <label key={o} className={`choice${values.includes(o) ? ' is-on' : ''}`}>
            <input type="checkbox" checked={values.includes(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------- tag input */

export function TagInput({ label, required, hint, error, span = 12, tip, values = [], onChange, placeholder, suggestions = [] }) {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const value = String(raw ?? draft).trim().replace(/,$/, '');
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
    if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const open = suggestions.filter((s) => !values.includes(s)).slice(0, 6);

  return (
    <div className={`field span-${span}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
        {tip && <Help text={tip} />}
      </label>
      <div className={`tag-box${error ? ' is-invalid' : ''}`}>
        {values.map((t) => (
          <span key={t} className="tag">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(values.filter((v) => v !== t))}>×</button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={values.length ? '' : placeholder}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add()}
        />
      </div>
      {open.length > 0 && (
        <div className="tag-suggest">
          {open.map((s) => (
            <button key={s} type="button" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------ searchable select */

export function SearchSelect({ label, required, hint, error, span = 6, tip, value, onChange, options, placeholder = 'Type to search' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);
  const id = useId();

  useEffect(() => {
    const onAway = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onAway);
    return () => document.removeEventListener('mousedown', onAway);
  }, []);

  const list = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  const pick = (o) => {
    onChange(o);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open && list[highlight]) {
      e.preventDefault();
      pick(list[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className={`field span-${span}`} ref={boxRef}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
        {tip && <Help text={tip} />}
      </label>
      <div className="combo">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className={`input${error ? ' is-invalid' : ''}`}
          value={open ? query : value || ''}
          placeholder={placeholder}
          onFocus={() => { setOpen(true); setHighlight(0); }}
          onKeyDown={onKeyDown}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        />
        {open && (
          <div className="combo-list" role="listbox">
            {list.length === 0 ? (
              <p className="combo-empty">No match. Press Escape and pick the closest option, or choose Other.</p>
            ) : (
              list.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={value === o}
                  className={i === highlight ? 'is-highlighted' : ''}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(o)}
                >
                  {o}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------ file inputs */

export function PhotoInput({ value, onChange, onError, uploading }) {
  const ref = useRef(null);

  const choose = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpe?g|png)$/.test(file.type)) return onError('The photo must be a JPG, JPEG or PNG file.');
    if (file.size > 4 * 1024 * 1024) return onError('The photo is larger than 4 MB. Choose a smaller image.');
    onChange(file);
  };

  return (
    <div className="field span-12">
      <label className="field-label">Profile photo</label>
      <div className="photo-row">
        {value ? (
          <img className="photo" src={value} alt="Profile preview" />
        ) : (
          <div className="photo-blank">No photo added</div>
        )}
        <div className="photo-actions">
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button type="button" className="btn btn-outline btn-sm" disabled={uploading} onClick={() => ref.current.click()}>
              {uploading ? 'Uploading' : value ? 'Change photo' : 'Upload photo'}
            </button>
            {value && (
              <button type="button" className="btn btn-plain btn-sm" onClick={() => onChange(null)}>Remove</button>
            )}
          </div>
          <p className="field-hint">JPG, JPEG or PNG up to 4 MB. A square headshot works best.</p>
        </div>
      </div>
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png" hidden onChange={choose} />
    </div>
  );
}

export function FileInput({ label = 'Certificate', span = 6, hint, value, onChange, onError, uploading }) {
  const ref = useRef(null);

  const choose = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^(image\/(jpe?g|png)|application\/pdf)$/.test(file.type)) {
      return onError('Upload a PDF, JPG, JPEG or PNG file.');
    }
    if (file.size > 8 * 1024 * 1024) return onError('The file is larger than 8 MB.');
    onChange(file);
  };

  return (
    <div className={`field span-${span}`}>
      {label && <label className="field-label">{label}</label>}
      {value && value.fileName ? (
        <div className="file-chip">
          <span aria-hidden>▤</span>
          <span className="file-name">{value.fileName}</span>
          <span className="file-size">{fileSize(value.fileSize)}</span>
          <button
            type="button"
            className="icon-btn is-danger"
            style={{ marginLeft: 'auto' }}
            aria-label="Remove file"
            onClick={() => onChange(null)}
          >
            ✕
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-outline" disabled={uploading} onClick={() => ref.current.click()}>
          {uploading ? 'Uploading' : 'Choose file'}
        </button>
      )}
      {hint && <p className="field-hint">{hint}</p>}
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={choose} />
    </div>
  );
}

/* proof is either a link or an uploaded file */
export function ProofInput({ label = 'Proof or supporting document', span = 12, proof, onChange, onError, error, uploading }) {
  const set = (patch) => onChange({ ...proof, ...patch });

  return (
    <div className={`field span-${span}`}>
      <label className="field-label">{label}</label>
      <div className="switch">
        <button type="button" className={proof.mode === 'link' ? 'is-on' : ''} onClick={() => set({ mode: 'link' })}>
          Paste a link
        </button>
        <button type="button" className={proof.mode === 'file' ? 'is-on' : ''} onClick={() => set({ mode: 'file' })}>
          Upload a file
        </button>
      </div>
      {proof.mode === 'link' ? (
        <>
          <input
            className={`input${error ? ' is-invalid' : ''}`}
            value={proof.url || ''}
            placeholder="https://"
            onChange={(e) => set({ url: e.target.value })}
          />
          {error ? <p className="field-error">{error}</p> : <p className="field-hint">A certificate page, repository or verification link.</p>}
        </>
      ) : (
        <FileInput
          label=""
          span={12}
          value={proof}
          uploading={uploading}
          hint="PDF, JPG, JPEG or PNG up to 8 MB"
          onError={onError}
          onChange={(file) => onChange(file || { ...proof, fileName: '', filePath: '', fileSize: 0 })}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------- repeated single rows */

export function RepeatRows({ label, required, tip, span = 12, values, onChange, placeholder, addLabel, error }) {
  const update = (i, v) => onChange(values.map((x, j) => (j === i ? v : x)));
  return (
    <div className={`field span-${span}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
        {tip && <Help text={tip} />}
      </label>
      <div className="mini-rows">
        {values.map((v, i) => (
          <div className="mini-row" key={i}>
            <input
              className={`input${error && i === 0 ? ' is-invalid' : ''}`}
              value={v}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              className="icon-btn is-danger"
              aria-label="Remove row"
              disabled={values.length === 1}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-link" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...values, ''])}>
        + {addLabel}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
