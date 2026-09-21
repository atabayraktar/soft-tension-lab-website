// The Works wall: one box per project. No project images exist yet, so every cell is a
// clearly-labeled slot — never a fake mark.
//
// Each project carries two info captions pinned inside the image, bottom-left (what it
// is, e.g. "Logo tasarımı") and bottom-right (who made it, e.g. "Ata Bayraktar"), and a
// `tone`: the image's own brightness. "dark" image → light captions, "light" image →
// dark captions. Set it per project when the real image lands.
const PLACEHOLDER = { left: 'info text', right: 'info text', lang: 'en', tone: 'dark' };

const PROJECTS = Array.from({ length: 9 }, (_, i) => ({
  ...PLACEHOLDER,
  n: String(i + 1).padStart(2, '0'),
}));

export default function LogoWall() {
  return (
    <ul className="logowall" aria-label="Seçilmiş işler (yer tutucu)">
      {PROJECTS.map((p) => (
        <li key={p.n} className={`logowall__cell logowall__cell--${p.tone}`} data-reveal>
          <span className="logowall__slot">
            <span className="logowall__slot-label">Logo · {p.n}</span>
            <span className="logowall__slot-note">Yer tutucu</span>
          </span>
          <span className="logowall__cap logowall__cap--left" lang={p.lang}>{p.left}</span>
          <span className="logowall__cap logowall__cap--right" lang={p.lang}>{p.right}</span>
        </li>
      ))}
    </ul>
  );
}
