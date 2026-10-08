import { useEffect, useState } from 'react';

function Stars({ value, onChange, interactive = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className="flex gap-1"
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`${value} out of 5 stars`}
    >
      {stars.map((star) => {
        const fill =
          Math.max(0, Math.min(1, value - star + 1)) * 100;

        const starContent = (
          <span
            className="relative inline-block text-2xl leading-none"
            style={{ width: '1em', height: '1em' }}
          >
            {/* Empty/background star */}
         <span className="absolute inset-0 text-white/20">
              ★
            </span>

            {/* Filled portion */}
            <span
              className="absolute inset-0 overflow-hidden text-gold-300"
              style={{ width: `${fill}%` }}
            >
              ★
            </span>
          </span>
        );

        if (!interactive) {
          return (
            <span key={star}>
              {starContent}
            </span>
          );
        }

        return (
          <span
            key={star}
            className="relative flex"
          >
            {/* Half-star click */}
            <button
              type="button"
              aria-label={`${star - 0.5} stars`}
              onClick={() => onChange(star - 0.5)}
              className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-pointer opacity-0"
            />

            {/* Full-star click */}
            <button
              type="button"
              aria-label={`${star} stars`}
              onClick={() => onChange(star)}
              className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-pointer opacity-0"
            />

            {starContent}
          </span>
        );
      })}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);

  const [form, setForm] = useState({
    name: '',
    rating: 5,
    message: '',
    website: '',
  });

  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();

      if (data.ok) {
        setReviews(data.reviews || []);
        setAverage(data.averageRating || 0);
      }
    } catch {
      // Keep the page usable if the API is temporarily unavailable
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();

    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.fields
            ? Object.values(data.fields)[0]
            : data.error || 'Could not submit review.'
        );
      }

      setForm({
        name: '',
        rating: 5,
        message: '',
        website: '',
      });

      setState('success');

      setTimeout(() => {
        setState('idle');
      }, 5000);
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }

  return (
    <section
      id="reviews"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT SIDE */}
        <div className="glass rounded-2xl p-7 sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-300">
            Client Reviews
          </p>

          <h2 className="mt-3 font-display text-3xl text-pearl sm:text-4xl">
            Your experience matters.
          </h2>

          {/* Average Rating */}
          <div className="mt-7 flex items-end gap-4">
            <span className="text-5xl font-bold text-gold-300">
              {average || '—'}
            </span>

            <div>
              <Stars value={Number(average) || 0} />

              <p className="mt-1 text-sm text-pearl/60">
                Based on approved reviews
              </p>
            </div>
          </div>

          {/* REVIEW FORM */}
          <form
            onSubmit={submit}
            className="mt-8 space-y-4"
          >
            <input
              className="w-full rounded-lg border border-gold-500/20 bg-navy-950/60 px-4 py-3 text-pearl"
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
              maxLength={80}
            />

            {/* RATING SELECTOR */}
            <div>
              <p className="mb-2 text-sm text-pearl/70">
                Your rating
              </p>

              <Stars
                value={form.rating}
                onChange={(rating) =>
                  setForm({
                    ...form,
                    rating,
                  })
                }
                interactive
              />

              <p className="mt-2 text-sm text-pearl/50">
                Selected rating: {form.rating} / 5
              </p>
            </div>

            <textarea
              className="min-h-28 w-full rounded-lg border border-gold-500/20 bg-navy-950/60 px-4 py-3 text-pearl"
              placeholder="Write your review"
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              required
              maxLength={1000}
            />

            {/* Honeypot */}
            <input
              tabIndex="-1"
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              value={form.website}
              onChange={(e) =>
                setForm({
                  ...form,
                  website: e.target.value,
                })
              }
            />

            <button
              className="btn-gold w-full"
              disabled={state === 'loading'}
            >
              {state === 'loading'
                ? 'Submitting…'
                : 'Submit Review'}
            </button>

            {state === 'success' && (
              <p className="text-sm text-green-300">
                Thank you! Your review is pending admin approval.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-300">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-gold-300">
                What clients say
              </p>

              <h3 className="mt-2 font-display text-3xl text-pearl">
                Trusted experiences
              </h3>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-pearl/60">
              Be the first to share your experience with EKADANTA TRADERS.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="glass rounded-2xl p-6"
                >
                  <Stars value={Number(r.rating) || 0} />

                  <p className="mt-4 text-pearl/80">
                    “{r.message}”
                  </p>

                  <p className="mt-5 text-sm font-semibold text-gold-300">
                    — {r.name}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
