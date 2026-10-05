import { useEffect, useMemo, useState } from 'react';

const Star = ({ value, size = 'text-2xl', interactive = false, selectedRating, onRate }) => {
  const fill = Math.max(0, Math.min(1, selectedRating - value + 1));

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={(event) => {
        if (!interactive || !onRate) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const isHalf = event.clientX - rect.left < rect.width / 2;
        onRate(value - (isHalf ? 0.5 : 0));
      }}
      className={`${size} leading-none ${
        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
      }`}
      aria-label={`${value - 0.5} to ${value} star rating`}
    >
      <span
        className="text-transparent bg-clip-text"
        style={{
          backgroundImage: `linear-gradient(
            90deg,
            #d8ad45 ${fill * 100}%,
            rgba(255,255,255,0.2) ${fill * 100}%
          )`,
        }}
      >
        ★
      </span>
    </button>
  );
};

const Stars = ({ rating, interactive = false, onRate }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        value={value}
        interactive={interactive}
        selectedRating={rating}
        onRate={onRate}
      />
    ))}
  </div>
);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/reviews');
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error('Unable to load reviews');
      }

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating || 0));
    } catch {
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const reviewCount = reviews.length;

  const displayedAverage = useMemo(() => {
    return Number(averageRating || 0).toFixed(1);
  }, [averageRating]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setSubmitted(false);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Unable to submit review');
      }

      setName('');
      setMessage('');
      setRating(5);
      setSubmitted(true);

      await loadReviews();

      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch {
      setError(
        'Your review could not be submitted right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#07101f] px-6 py-20 text-white"
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8ad45]">
            Customer Reviews
          </p>

          <h2 className="font-serif text-4xl md:text-5xl">
            What Our Customers Say
          </h2>

          <p className="mt-4 text-white/65">
            Your experience matters to EKADANTA TRADERS.
            <br />
            Share your experience with us.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mx-auto mb-12 flex max-w-md flex-col items-center justify-center rounded-2xl border border-[#d8ad45]/25 bg-[#111c2e] px-6 py-8 text-center shadow-xl">
          <div className="text-5xl font-semibold text-[#d8ad45]">
            {displayedAverage}
          </div>

          <div className="mt-3">
            <Stars rating={averageRating} />
          </div>

          <p className="mt-3 text-sm text-white/55">
            Based on {reviewCount} customer{' '}
            {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          {/* Reviews */}
          <div>
            <h3 className="mb-5 font-serif text-2xl">
              Customer Experiences
            </h3>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-[#111c2e] p-6 text-white/55">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#111c2e] p-6 text-white/55">
                No reviews yet. Be the first to share your experience.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id || `${review.name}-${review.created_at}`}
                    className="rounded-2xl border border-white/10 bg-[#111c2e] p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-white">
                        {review.name}
                      </h4>

                      <Stars rating={Number(review.rating)} />
                    </div>

                    <p className="mt-3 leading-7 text-white/65">
                      {review.message}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="rounded-2xl border border-[#d8ad45]/20 bg-[#111c2e] p-6 md:p-8">
            <h3 className="font-serif text-2xl">
              Rate Your Experience
            </h3>

            <p className="mt-2 text-sm text-white/55">
              We would love to hear your feedback.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Rating */}
              <div>
                <label className="mb-3 block text-sm text-white/70">
                  Your Rating
                </label>

                <Stars
                  rating={rating}
                  interactive
                  onRate={(value) => {
                    if (value >= 0.5) setRating(value);
                  }}
                />

                <p className="mt-2 text-sm text-[#d8ad45]">
                  {rating.toFixed(1)} / 5
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Your Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={80}
                  className="w-full rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#d8ad45]"
                />
              </div>

              {/* Review */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Your Review
                </label>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={5}
                  required
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#d8ad45]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#d8ad45] px-6 py-3 font-semibold text-[#07101f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>

              {submitted && (
                <p className="text-center text-sm text-[#d8ad45]">
                  Thank you for your review! ⭐
                  <br />
                  Your review will appear after approval.
                </p>
              )}

              {error && (
                <p className="text-center text-sm text-red-400">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
