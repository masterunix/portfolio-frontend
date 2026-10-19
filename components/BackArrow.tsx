/**
 * BackArrow.tsx — The ← in every back link, drawn as a line icon so it sits centred
 * on the text and keeps its weight in any font (site.css, .back-arrow).
 */
export default function BackArrow() {
  return (
    <svg className="back-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
    </svg>
  );
}
