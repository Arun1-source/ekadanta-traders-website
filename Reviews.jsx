import { useMemo, useState } from 'react';

const initialReviews = [
  {
    name: 'Rahul',
    rating: 5,
    message: 'Excellent service and professional dealing.',
  },
  {
    name: 'Aman',
    rating: 5,
    message: 'Very smooth experience with EKADANTA TRADERS.',
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0';

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !message.trim()) return;

    setReviews((current) => [
      {
        name: name.trim(),
        rating,
        message: message.trim(),
      },
      ...current,
    ]);

    setName('');
    setMessage('');
    setRating(5);
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000);
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
            Share your experience with us.
          </p>
        </div>

        {/* Rating summary */}
        <div className="mb-12 flex flex-col items-center justify-center rounded-2xl border border-[#d8ad45]/25 bg-[#111c2e] px-6 py-8 text-center shadow-xl">
          <div className="text-5xl font-semibold text-[#d8ad45]">
            {averageRating}
          </div>

          <div className="mt-2 text-2xl tracking-[0.15em] text-[#d8ad45]">
            ★★★★★
          </div>

          <p className="mt-2 text-sm text-white/55">
            Based on {reviews.length} customer reviews
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          {/* Reviews */}
          <div>
            <h3 className="mb-5 font-serif text-2xl">
              Customer Experiences
            </h3>

            <div className="space-y-4">
              {reviews.map((review, index) => (
                <article
                  key={`${review.name}-${index}`}
                  className="rounded-2xl border border-white/10 bg-[#111c2e] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-semibold text-white">
                      {review.name}
                    </h4>

                    <div className="text-[#d8ad45]">
                      {'★'.repeat(review.rating)}
                      <span className="text-white/20">
                        {'★'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 leading-7 text-white/65">
                    “{review.message}”
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Review form */}
          <div className="rounded-2xl border border-[#d8ad45]/20 bg-[#111c2e] p-6 md:p-8">
            <h3 className="font-serif text-2xl">
              Rate Your Experience
            </h3>

            <p className="mt-2 text-sm text-white/55">
              We would love to hear your feedback.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Stars */}
              <div>
                <label className="mb-3 block text-sm text-white/70">
                  Your Rating
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition ${
                        star <= rating
                          ? 'text-[#d8ad45]'
                          : 'text-white/20'
                      } hover:scale-110`}
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>
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
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#d8ad45]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#d8ad45] px-6 py-3 font-semibold text-[#07101f] transition hover:brightness-110"
              >
                Submit Review
              </button>

              {submitted && (
                <p className="text-center text-sm text-[#d8ad45]">
                  Thank you for your review! ⭐
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
