import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, ExternalLink, Plus, X } from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const { reviews, addReview, services, yelpProfileUrl } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);

  // New review form state
  const [authorName, setAuthorName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [serviceId, setServiceId] = useState(services[0]?.id || 'driveway-wash');
  const [reviewText, setReviewText] = useState('');

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'yelp') return r.source === 'yelp';
    return r.serviceId === selectedFilter;
  });

  const handleOpenReviewModal = () => {
    setAuthorName('');
    setNeighborhood('');
    setRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) return;

    const srv = services.find((s) => s.id === serviceId);

    addReview({
      author: authorName.trim(),
      neighborhood: neighborhood.trim() || 'Sacramento, CA',
      rating,
      serviceId,
      serviceName: srv ? srv.name : 'Exterior Cleaning',
      content: reviewText.trim(),
      verifiedHomeowner: true,
      source: 'direct'
    });

    setReviewModalOpen(false);
  };

  return (
    <section id="reviews-section" className="py-16 lg:py-24 bg-white border-b border-[#E8EEF1] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Yelp Proof */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EEF1] text-[#263F50] text-xs font-semibold mb-2.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Customer Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Customer Reviews
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs sm:text-sm text-[#555555]">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-[#222222]">5.0 Yelp Rating</span>
              <span className="text-gray-300">·</span>
              <span>Serving homeowners and businesses across Sacramento</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={yelpProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-rounded px-4 py-2.5 bg-[#F8F9F7] hover:bg-[#E8EEF1] border border-[#D5E0E6] text-[#222222] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="font-bold text-[#D32323]">Yelp</span>
              <span>View Yelp Listing</span>
              <ExternalLink className="w-3 h-3 text-[#555555]" />
            </a>

            <button
              onClick={handleOpenReviewModal}
              className="btn-rounded px-4 py-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-sky-200" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`btn-rounded px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#263F50] text-white shadow-xs'
                : 'bg-[#F8F9F7] hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setSelectedFilter('yelp')}
            className={`btn-rounded px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'yelp'
                ? 'bg-[#D32323] text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-[#D32323] border border-rose-200'
            }`}
          >
            <span className="font-bold">Yelp</span>
            <span>Verified Feed</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F8F9F7] rounded-2xl p-6 border border-[#E8EEF1] shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#263F50]/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Header with Stars and Source Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {rev.source === 'yelp' ? (
                    <a
                      href={rev.yelpReviewUrl || yelpProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#D32323] bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 transition-colors"
                    >
                      <span>Yelp Review</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#263F50] bg-[#E8EEF1] px-2.5 py-0.5 rounded-full">
                      Verified Client
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-[#333333] text-xs sm:text-sm leading-relaxed">
                  "{rev.content}"
                </p>
              </div>

              {/* Author & Service Footer */}
              <div className="pt-3 border-t border-[#E8EEF1] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#E8EEF1] text-[#263F50] font-bold flex items-center justify-center text-xs">
                    {rev.avatarInitial || rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#222222]">{rev.author}</div>
                    <div className="text-[11px] text-[#777777]">{rev.neighborhood}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-[#263F50] font-semibold truncate max-w-[130px]">
                    {rev.serviceName}
                  </div>
                  {rev.date && <div className="text-[10px] text-[#888888]">{rev.date}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E8EEF1] shadow-2xl relative text-[#222222]">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#F8F9F7] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#222222] mb-1">Leave a Review</h3>
            <p className="text-xs text-[#555555] mb-5">Share your experience with All Year Pressure Washing.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g., Jennifer R."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] mb-1">Neighborhood / City</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g., Midtown Sacramento"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">Service Received</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about the results and customer service..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn-rounded px-4 py-2 text-xs font-semibold text-[#555555] hover:text-[#222222] bg-white border border-[#E8EEF1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-rounded px-5 py-2 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
