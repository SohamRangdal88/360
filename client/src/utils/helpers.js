/* Utility helpers — dates, formatting, deep set */

export function setIn(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.');
  const copy = { ...obj };
  let current = copy;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (Array.isArray(current[key])) {
      current[key] = [...current[key]];
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return copy;
}

export function formatDate(d) {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x)) return d;
  return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRupees(n) {
  const v = Number(n || 0);
  return v > 0 ? '₹' + v.toLocaleString('en-IN') : '';
}

export function age(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth)) return '';
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years > 0 ? `${years} years` : '';
}

export function duration(from, to) {
  if (!from || !to) return '';
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a) || isNaN(b) || b < a) return '';

  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months--;
  if (months < 0) return '';

  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y} year${y > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} month${m > 1 ? 's' : ''}`);
  return parts.join(' ') || 'Less than a month';
}

export function fileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
