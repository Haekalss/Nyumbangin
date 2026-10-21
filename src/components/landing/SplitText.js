'use client';

/**
 * Animasi teks untuk headline.
 *
 * mode = 'words' : tiap kata dipecah & dianimasikan sendiri (stagger).
 * mode = 'line'  : satu blok dianimasikan utuh.
 *
 * Catatan penting: elemen yang memakai `background-clip: text` (gradient)
 * TIDAK boleh dipecah per kata, karena `transform` pada child membuatnya
 * menjadi layer terpisah sehingga gradient parent tidak ikut ter-clip.
 * Untuk mode 'line', gradient & transform berada pada elemen yang sama
 * sehingga selalu tampil benar.
 */
export default function SplitText({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
  step = 45,
  duration = 500,
  mode = 'words',
}) {
  // Mode line: satu elemen, aman untuk gradient
  if (mode === 'line') {
    return (
      // pb untuk ruang descender, -mb supaya tidak menambah tinggi baris
      <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
        <span
          className={`nb-split-line inline-block ${className} ${wordClassName}`}
          style={{ animationDelay: `${delay}ms`, animationDuration: `${duration}ms` }}
        >
          {text}
        </span>
      </span>
    );
  }

  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em]"
        >
          <span
            className={`nb-split-word inline-block ${wordClassName}`}
            style={{
              animationDelay: `${delay + i * step}ms`,
              animationDuration: `${duration}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}
