export function validateReview(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const rating = Number(body?.rating);
  const errors = {};
  if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2-80 characters.';
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || rating * 2 !== Math.round(rating * 2)) errors.rating = 'Rating must be between 1 and 5 in 0.5 increments.';
  if (message.length < 5 || message.length > 1000) errors.message = 'Review must be 5-1000 characters.';
  return { valid: Object.keys(errors).length === 0, errors, data: { name, rating, message } };
}
