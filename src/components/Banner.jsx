// The statement banner between the showcase and the black finale: one full-bleed frame
// running edge to edge, the two-line statement set straight onto the studio's
// "lead with TENSION." artwork. It butts against the black finale below — no Paper gap.
//
// The artwork carries its own type (coordinates top-left, the sign-off bottom), so the
// frame takes the picture's own ratio (4:5 portrait on phones, 1600:440 wide from 640px)
// and nothing crops, drifts or scales it. The statement sits near the top, centred, clear
// of both. Paper type with a soft Ink halo keeps it readable over the bright and the dark
// patches of the artwork alike.
export default function Banner() {
  return (
    <section className="banner" aria-label="Stüdyo notu">
      <div className="banner__frame" data-nav-invert>
        <picture className="banner__field">
          <source media="(min-width: 640px)" srcSet="/images/banner/banner-900.webp 900w, /images/banner/banner-1600.webp 1600w" sizes="100vw" />
          <img
            className="banner__img"
            src="/images/banner/banner-mobile.webp"
            width="400"
            height="500"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </picture>

        <p className="banner__text" data-reveal>
          <span className="banner__line banner__line--lead">Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyor,</span>
          <span className="banner__line banner__line--punch">markalar için samimi görsel hikayeler yaratıyoruz.</span>
        </p>
      </div>
    </section>
  );
}
