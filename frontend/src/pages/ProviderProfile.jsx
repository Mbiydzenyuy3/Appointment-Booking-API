import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import BookAppointmentForm from "../components/BookAppointments/BookAppointment.jsx";
import MessageThread from "../components/Messaging/MessageThread.jsx";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ProgressiveImage from "../components/Common/ProgressiveImage.jsx";
import { useConnectionSpeed } from "../hooks/useConnectionSpeed.js";
import api from "../services/api.js";
import { toast } from "react-toastify";
import { trackEvent } from "../services/analytics.js";
import { ArrowLeft } from "lucide-react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  EyeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ClockIcon
} from "@heroicons/react/24/solid";

const ProviderProfile = () => {
  const { bookingSlug } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  // Enable connection speed detection for slow network optimizations
  useConnectionSpeed();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState({ open: false, service: null });

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewState, setReviewState] = useState("idle"); // idle | submitting | success | no_booking | already_reviewed | error
  const [reviewError, setReviewError] = useState("");
  const [hasBooked, setHasBooked] = useState(false);

  const fetchProviderProfile = async () => {
    try {
      const response = await api.get(`/providers/profile/${bookingSlug}`);
      const data = response.data.data;

      setProvider({
        ...data,
        name: data.name,
        bio: data.bio || "Professional service provider",
        profile_views: data.profile_views
      });
      setServices(data.services || []);
      setReviews(data.reviews || []);

      // Track profile view
      trackEvent("Profile Viewed", {
        provider_id: data.provider_id,
        provider_name: data.name,
        booking_slug: bookingSlug
      });
    } catch (error) {
      console.error("Failed to fetch provider profile:", error);
      toast.error(
        "We're having trouble loading this profile right now. Please try refreshing the page."
      );
      navigate("/explore");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingSlug) {
      fetchProviderProfile();
    }
  }, [bookingSlug]);

  // After provider data loads, check if this logged-in client has a booking with them
  useEffect(() => {
    if (!user || user.user_type !== "client" || !provider?.provider_id) return;
    api.get(`/appointments/has-booked?providerId=${provider.provider_id}`)
      .then((res) => setHasBooked(res.data.data?.hasBooked === true))
      .catch(() => setHasBooked(false));
  }, [user, provider?.provider_id]);

  const handleBookClick = (service) => {
    setBookingModal({ open: true, service });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🔍</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Provider not found
          </h2>
          <p className='text-gray-600 mb-4'>
            The provider you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className='btn btn-primary'
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className='w-4 h-4 text-yellow-400' />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className='w-4 h-4 text-yellow-400 fill-current'
            viewBox='0 0 20 20'
          >
            <defs>
              <linearGradient id={`half-star-${i}`}>
                <stop offset='50%' stopColor='currentColor' />
                <stop offset='50%' stopColor='transparent' />
              </linearGradient>
            </defs>
            <path
              fill={`url(#half-star-${i})`}
              d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
            />
          </svg>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className='w-4 h-4 text-gray-300' />
        );
      }
    }
    return stars;
  };

  const totalSlots = services.reduce(
    (sum, service) => sum + (service.available_slots || 0),
    0
  );
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  function detectUrlType(url) {
    if (!url || !url.trim()) return "image";
    const u = url.trim().toLowerCase();
    if (u.includes("tiktok.com")) return "tiktok";
    if (u.includes("youtube.com") || u.includes("youtu.be/")) return "youtube";
    if (u.includes("vimeo.com")) return "vimeo";
    return "image";
  }

  function getYoutubeEmbedUrl(url) {
    try {
      const u = new URL(url.trim());
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.replace("/shorts/", "")}`;
      if (u.pathname.startsWith("/embed/")) return url.trim();
      return null;
    } catch { return null; }
  }

  function getTikTokEmbedUrl(url) {
    try {
      const u = new URL(url.trim());
      const match = u.pathname.match(/\/video\/(\d+)/);
      if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
      return null;
    } catch { return null; }
  }

  function getVimeoEmbedUrl(url) {
    try {
      const u = new URL(url.trim());
      const match = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
      return null;
    } catch { return null; }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError("Please select a star rating."); return; }
    setReviewState("submitting");
    setReviewError("");
    try {
      const res = await api.post("/providers/reviews", {
        provider_id: provider.provider_id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      const newReview = res.data.data;
      setReviews((prev) => [{ ...newReview, reviewer_name: user?.name || "You" }, ...prev]);
      setReviewState("success");
    } catch (err) {
      const code = err.response?.data?.error_code;
      if (code === "REVIEW_NOT_ALLOWED") {
        setReviewState("no_booking");
      } else if (code === "REVIEW_ALREADY_EXISTS") {
        setReviewState("already_reviewed");
      } else {
        setReviewState("error");
        setReviewError(err.response?.data?.message || "Failed to submit review. Please try again.");
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className='fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 group'
        aria-label='Go back to home'
      >
        <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
      </button>
      <div className='container-mobile py-8'>
        {/* Hero Section - Critical Content */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 critical-content progressive-content'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6'>
            <div className='flex items-center space-x-4 mb-4 md:mb-0'>
              {provider.logo_url ? (
                <img
                  src={provider.logo_url}
                  alt={provider.name}
                  className='w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white'
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg'
                style={{ display: provider.logo_url ? "none" : "flex" }}
              >
                <span className='text-3xl font-bold text-white'>
                  {provider.name?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
              <div>
                <div className='flex items-center space-x-2 mb-1'>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {provider.name}
                  </h1>
                  <div className='flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                    <CheckCircleIcon className='w-3 h-3 mr-1' />
                    Verified
                  </div>
                </div>
                <div className='flex items-center space-x-4 mb-2'>
                  <div className='flex items-center space-x-1'>
                    {renderStars(averageRating)}
                    <span className='text-sm font-medium text-gray-900 ml-1'>
                      {averageRating.toFixed(1)}
                    </span>
                    <span className='text-sm text-gray-500'>
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </div>
                <div className='flex items-center space-x-4 text-sm text-gray-600'>
                  {provider.years_of_experience && (
                    <div className='flex items-center'>
                      <CalendarDaysIcon className='w-4 h-4 mr-1' />
                      {provider.years_of_experience} years experience
                    </div>
                  )}
                  <div className='flex items-center'>
                    <UsersIcon className='w-4 h-4 mr-1' />
                    {provider.total_bookings || 0} bookings completed
                  </div>
                  <div className='flex items-center'>
                    <EyeIcon className='w-4 h-4 mr-1' />
                    {provider.profile_views} profile views
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end space-y-2'>
              {totalSlots > 0 && (
                <div className='bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium'>
                  ⚡ Only {totalSlots} times left this week!
                </div>
              )}
              <button
                onClick={() =>
                  services.length > 0 && handleBookClick(services[0])
                }
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors'
              >
                Book Now - Save Time
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            {provider.phone && (
              <div className='flex items-center space-x-2'>
                <PhoneIcon className='w-5 h-5 text-green-600' />
                {hasBooked ? (
                  <span className='text-sm font-medium text-gray-700'>
                    {provider.phone}
                  </span>
                ) : (
                  <span className='text-sm text-gray-400 italic'>
                    Book to see contact
                  </span>
                )}
              </div>
            )}
            {provider.certifications && provider.certifications.length > 0 && (
              <div className='flex items-center space-x-2'>
                <ShieldCheckIcon className='w-5 h-5 text-blue-600' />
                <span className='text-sm font-medium text-gray-700'>
                  Certified Professional
                </span>
              </div>
            )}
            {provider.gallery &&
              provider.gallery.length > 0 && (
                <div className='flex items-center space-x-2'>
                  <PhotoIcon className='w-5 h-5 text-purple-600' />
                  <span className='text-sm font-medium text-gray-700'>
                    Portfolio Available
                  </span>
                </div>
              )}
            {reviews.length >= 10 && (
              <div className='flex items-center space-x-2'>
                <CheckCircleIcon className='w-5 h-5 text-green-600' />
                <span className='text-sm font-medium text-gray-700'>
                  Highly Rated
                </span>
              </div>
            )}
          </div>

          <p className='text-gray-600 leading-relaxed'>{provider.bio}</p>
        </div>

        {/* Portfolio & Gallery - Non-critical content */}
        {provider.gallery && provider.gallery.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 non-critical'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Portfolio &amp; Gallery
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {provider.gallery.slice(0, 12).map((item) => {
                const urlType = detectUrlType(item.image_url);
                const isVideo = urlType === "youtube" || urlType === "tiktok" || urlType === "vimeo";
                return (
                  <div key={item.gallery_id} className='rounded-lg overflow-hidden bg-gray-100'>
                    <div className={isVideo ? "aspect-video" : "aspect-square"}>
                      {urlType === "youtube" ? (
                        <iframe
                          src={getYoutubeEmbedUrl(item.image_url)}
                          className='w-full h-full'
                          frameBorder='0'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                          allowFullScreen
                          title={item.caption || "YouTube video"}
                        />
                      ) : urlType === "tiktok" ? (
                        (() => {
                          const embedUrl = getTikTokEmbedUrl(item.image_url);
                          return embedUrl ? (
                            <iframe
                              src={embedUrl}
                              className='w-full h-full'
                              frameBorder='0'
                              allow='autoplay; gyroscope;'
                              allowFullScreen
                              title={item.caption || "TikTok video"}
                            />
                          ) : (
                            <a href={item.image_url} target='_blank' rel='noopener noreferrer'
                               className='w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-2 no-underline'>
                              <span className='text-3xl'>🎵</span>
                              <span className='text-xs text-gray-300'>Watch on TikTok</span>
                            </a>
                          );
                        })()
                      ) : urlType === "vimeo" ? (
                        <iframe
                          src={getVimeoEmbedUrl(item.image_url)}
                          className='w-full h-full'
                          frameBorder='0'
                          allow='autoplay; fullscreen; picture-in-picture'
                          allowFullScreen
                          title={item.caption || "Vimeo video"}
                        />
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.caption || "Gallery photo"}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                        />
                      )}
                    </div>
                    {item.caption && (
                      <p className='text-xs text-gray-600 text-center px-2 py-1 truncate'>
                        {item.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {provider.gallery.length > 12 && (
              <p className='text-sm text-gray-500 mt-4 text-center'>
                +{provider.gallery.length - 12} more items
              </p>
            )}
          </div>
        )}

        {/* Testimonials */}
        {provider.testimonials && provider.testimonials.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              What Clients Say
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {provider.testimonials.slice(0, 4).map((testimonial, index) => (
                <div
                  key={index}
                  className='bg-gray-50 rounded-lg p-4 border-l-4 border-green-500'
                >
                  <div className='flex items-center mb-2'>
                    {renderStars(testimonial.rating || 5)}
                  </div>
                  <p className='text-gray-700 italic mb-2'>
                    "{testimonial.text}"
                  </p>
                  <p className='text-sm font-medium text-gray-900'>
                    - {testimonial.author || "Happy Client"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Recent Reviews
              </h2>
              <div className='flex items-center space-x-2'>
                <div className='flex items-center'>
                  {renderStars(averageRating)}
                  <span className='ml-2 text-lg font-semibold text-gray-900'>
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className='text-gray-500'>
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
            <div className='space-y-4'>
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.review_id}
                  className='border-b border-gray-100 pb-4 last:border-b-0'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-700'>
                          {review.reviewer_name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <span className='font-medium text-gray-900'>
                        {review.reviewer_name}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className='text-gray-700'>{review.comment}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {reviews.length > 5 && (
              <div className='text-center mt-4'>
                <button
                  onClick={() => navigate("/explore")}
                  className='text-green-600 hover:text-green-700 font-medium'
                >
                  View all {reviews.length} reviews
                </button>
              </div>
            )}
          </div>
        )}

        {/* Leave a Review */}
        {user && user.user_type !== "provider" && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Leave a Review</h2>

            {reviewState === "success" && (
              <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm font-medium'>
                ✅ Thank you! Your review has been submitted.
              </div>
            )}

            {reviewState === "no_booking" && (
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm'>
                You can only leave a review after completing an appointment with this provider.
              </div>
            )}

            {reviewState === "already_reviewed" && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm'>
                You have already reviewed this provider.
              </div>
            )}

            {(reviewState === "idle" || reviewState === "error" || reviewState === "submitting") && (
              <form onSubmit={handleSubmitReview} className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700 mb-2'>Your Rating <span className='text-red-500'>*</span></p>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button'
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className='text-3xl focus:outline-none transition-transform hover:scale-110'
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        {star <= (reviewHover || reviewRating)
                          ? <StarIcon className='w-8 h-8 text-yellow-400' />
                          : <StarOutlineIcon className='w-8 h-8 text-gray-300' />}
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className='ml-2 text-sm text-gray-500 self-center'>
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Comment <span className='text-gray-400 font-normal'>(optional)</span>
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder='Share your experience with this provider...'
                    rows={3}
                    maxLength={1000}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
                  />
                </div>

                {reviewError && (
                  <p className='text-sm text-red-600'>{reviewError}</p>
                )}

                <button
                  type='submit'
                  disabled={reviewState === "submitting" || reviewRating === 0}
                  className='px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors'
                >
                  {reviewState === "submitting" ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Services Section */}
        <section>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Book Your Service
              </h2>
              <p className='text-gray-600 mt-1'>
                Choose from available services below
              </p>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-2'>
                {services.length} services available
              </div>
              {totalSlots > 0 && (
                <div className='text-xs text-orange-600 font-medium'>
                  🔥 Limited times available
                </div>
              )}
            </div>
          </div>

          {services.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='text-4xl mb-4'>🛠️</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No services available
              </h3>
              <p className='text-gray-600'>
                This provider hasn't added any services yet.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 group hover:shadow-lg transition-all duration-200 hover-lift'
                >
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors'>
                        {service.name}
                      </h3>
                      <div className='text-right'>
                        <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold'>
                          {formatPrice(service.price)}
                        </div>
                        {service.available_slots <= 5 &&
                          service.available_slots > 0 && (
                            <div className='text-xs text-orange-600 font-medium mt-1'>
                              Only {service.available_slots} left!
                            </div>
                          )}
                      </div>
                    </div>

                    <p
                      className='text-gray-600 mb-4 overflow-hidden'
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {service.description}
                    </p>

                    <div className='flex items-center justify-between mb-4 text-sm text-gray-500'>
                      <span className='flex items-center'>
                        <ClockIcon className='w-4 h-4 mr-1' />
                        {service.duration} min
                      </span>
                      <span className='flex items-center'>
                        <CalendarDaysIcon className='w-4 h-4 mr-1' />
                        {service.available_slots} times available
                      </span>
                    </div>

                    {/* Social Proof */}
                    <div className='flex items-center justify-between mb-4 text-xs text-gray-500'>
                      <span>⭐ Popular choice</span>
                      <span>{provider.total_bookings || 0} total bookings</span>
                    </div>

                    <button
                      onClick={() => handleBookClick(service)}
                      className='w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md'
                    >
                      Book Now - Instant Confirmation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {services.length > 0 && (
            <div className='mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center border border-green-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Ready to book with {provider.name}?
              </h3>
              <p className='text-gray-600 mb-4'>
                Join hundreds of satisfied customers. Book now and secure your
                preferred time slot.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button
                  onClick={() =>
                    services.length > 0 && handleBookClick(services[0])
                  }
                  className='bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors'
                >
                  Book Your Appointment
                </button>
                <button
                  onClick={() => navigate("/explore")}
                  className='border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                >
                  View Availability
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Messaging Section — only for clients who have booked with this provider */}
        {user && user.user_type !== "provider" && provider?.provider_id && hasBooked && (
          <section className='mt-8'>
            <div className='flex items-center gap-2 mb-4'>
              <ChatBubbleLeftRightIcon className='w-5 h-5 text-green-600' />
              <h2 className='text-xl font-semibold text-gray-900'>
                Message {provider.name}
              </h2>
            </div>
            <div
              className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
              style={{ minHeight: 360 }}
            >
              <MessageThread
                conversation={{ provider_id: provider.provider_id, provider_name: provider.name }}
                onBack={null}
              />
            </div>
          </section>
        )}

        {/* Show "book first" prompt to clients who haven't booked yet */}
        {user && user.user_type !== "provider" && provider?.provider_id && !hasBooked && (
          <section className='mt-8'>
            <div className='bg-green-50 border border-green-100 rounded-xl p-6 text-center'>
              <ChatBubbleLeftRightIcon className='w-8 h-8 text-green-600 mx-auto mb-3' />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Book first to message {provider.name}
              </h3>
              <p className='text-gray-600 text-sm mb-4'>
                Messaging and full contact details are available to clients who have booked an appointment.
                Book a service below to unlock direct messaging.
              </p>
              {services.length > 0 && (
                <button
                  onClick={() => handleBookClick(services[0])}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors'
                >
                  Book an appointment
                </button>
              )}
            </div>
          </section>
        )}

        {/* Prompt non-logged-in visitors to sign in */}
        {!user && provider?.provider_id && (
          <section className='mt-8'>
            <div className='bg-green-50 border border-green-100 rounded-xl p-6 text-center'>
              <ChatBubbleLeftRightIcon className='w-8 h-8 text-green-600 mx-auto mb-3' />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Want to message {provider.name}?
              </h3>
              <p className='text-gray-600 text-sm mb-4'>
                Sign in and book an appointment to unlock direct messaging and full contact details.
              </p>
              <button
                onClick={() => navigate("/login")}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors'
              >
                Sign in
              </button>
            </div>
          </section>
        )}

        {/* Back to Explore */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => navigate("/explore")}
            className='text-green-600 hover:text-green-700 font-medium'
          >
            ← Back to Explore
          </button>
        </div>

        {/* Booking Modal */}
        <BookAppointmentForm
          providerId={provider.provider_id}
          isOpen={bookingModal.open}
          onClose={() => setBookingModal({ open: false, service: null })}
          service={bookingModal.service}
        />
      </div>
    </div>
  );
};

export default ProviderProfile;
