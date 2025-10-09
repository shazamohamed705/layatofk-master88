import React, { useState, useEffect } from 'react';
import { postForm, getJson } from '../../api';

const RatingModal = ({ isOpen, onClose, advertiserId, advId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  // Reset state when modal opens with new ad
  useEffect(() => {
    if (isOpen && advertiserId && advId) {
      // Reset states first
      setRating(0);
      setComment('');
      setExistingRating(null);
      setIsSubmitting(false);
      
      // Then check for existing rating
      checkExistingRating();
    }
  }, [isOpen, advertiserId, advId]);

  // Close modal if user already rated this seller
  useEffect(() => {
    if (isOpen && existingRating) {
      alert('لقد قيّمت هذا البائع من قبل');
      onClose();
    }
  }, [isOpen, existingRating, onClose]);

  const checkExistingRating = async () => {
    try {
      const response = await getJson('/api/rating');
      if (response?.status && Array.isArray(response.data)) {
        // Find rating for this specific advertiser and ad
        const userRating = response.data.find(
          item => item.advertiser_id === advertiserId && item.adv_id === advId
        );
        if (userRating) {
          setExistingRating(userRating);
          setRating(userRating.rating || 0);
          setComment(userRating.comment || '');
        }
      }
    } catch (error) {
      console.error('Error checking existing rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('يرجى اختيار تقييم');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new rating (no update allowed)
      const response = await postForm('/api/rating', {
        advertiser_id: advertiserId,
        adv_id: advId,
        rating: rating,
        comment: comment
      });
      
      if (response?.status) {
        alert('تم إرسال التقييم بنجاح!');
        onClose();
      } else {
        const errorMsg = response?.msg || response?.message;
        // Check if user already rated this seller
        if (errorMsg && (errorMsg.includes('قيمت') || errorMsg.includes('سابق') || errorMsg.includes('موجود'))) {
          alert('لقد قيّمت هذا البائع من قبل');
          onClose();
        } else {
          alert(errorMsg || 'فشل في إرسال التقييم');
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMsg = error?.message || 'حدث خطأ أثناء إرسال التقييم';
      
      // Check if it's a duplicate rating error
      if (errorMsg.includes('قيمت') || errorMsg.includes('سابق') || errorMsg.includes('موجود') || errorMsg.includes('duplicate')) {
        alert('لقد قيّمت هذا البائع من قبل');
        onClose();
      } else {
        alert(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getRatingText = () => {
    switch(rating) {
      case 1: return 'ضعيف ';
      case 2: return 'مقبول';
      case 3: return 'جيد';
      case 4: return 'جيد جدا';
      case 5: return 'ممتاز';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-slideUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white text-center mb-1">تقييم البائع</h2>
          <p className="text-slate-300 text-sm text-center">نرجو تقييم تجربتك مع البائع</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          
          {/* Stars Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">التقييم</label>
            <div className="flex justify-center gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all duration-200 ${
                    star <= rating
                      ? 'text-amber-500'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm font-medium text-slate-600">
                {getRatingText()}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              الملاحظات <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="أضف ملاحظاتك حول التعامل مع البائع..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-sm"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-300"
            >
              إلغاء
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                isSubmitting || rating === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  جاري الإرسال
                </span>
              ) : (
                'إرسال التقييم'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
