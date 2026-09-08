// The Works logo wall. Dark, silent, no links, no boxes, no captions, no hover chrome.
// No client logos exist yet, so every cell is a clearly-labeled slot — never a fake mark.
const SLOTS = Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(2, '0'));

export default function LogoWall() {
  return (
    <ul className="logowall" aria-label="Seçilmiş işler — logo duvarı (yer tutucu)">
      {SLOTS.map((n) => (
        <li key={n} className="logowall__cell" data-reveal>
          <span className="logowall__slot">
            <span className="logowall__slot-label">Logo · {n}</span>
            <span className="logowall__slot-note">Yer tutucu</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
