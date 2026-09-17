import { useEffect, useId, useRef, useState } from 'react';

/**
 * Custom-styled listbox replacing the native <select> — the browser's own
 * dropdown panel can't be restyled and clashed with the brand system.
 * Follows the ARIA APG "select-only" listbox-button pattern: focus stays on
 * the trigger button the whole time; the open list is announced via
 * aria-activedescendant, never receives DOM focus itself.
 */
export default function Select({ id, options, value, onChange, onBlur, required, invalid, describedBy, placeholder = 'Seçin' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const uid = useId();
  const listboxId = `${id || uid}-listbox`;

  const selectedIndex = options.indexOf(value);

  useEffect(() => {
    if (!open) return undefined;
    const onDocPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocPointer);
    return () => document.removeEventListener('mousedown', onDocPointer);
  }, [open]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const commit = (index) => {
    const opt = options[index];
    if (opt !== undefined) onChange(opt);
    setOpen(false);
  };

  const onTriggerKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className="select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        onBlur={() => { if (!open) onBlur?.(); }}
      >
        <span className={`select__value ${value ? '' : 'is-placeholder'}`}>{value || placeholder}</span>
        <span className="select__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
        </span>
      </button>
      {open ? (
        <ul id={listboxId} className="select__panel" role="listbox" aria-label={placeholder}>
          {options.map((o, i) => (
            <li
              key={o}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o === value}
              className={`select__option ${i === activeIndex ? 'is-active' : ''} ${o === value ? 'is-selected' : ''}`.trim()}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => commit(i)}
            >
              {o}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
