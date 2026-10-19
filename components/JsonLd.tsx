/**
 * JsonLd.tsx — Structured data for search engines, as a <script type="application/ld+json">.
 * `<` is escaped so text from the content can never close the script tag.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
