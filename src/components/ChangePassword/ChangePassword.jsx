import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postForm } from '../../api';
import { IoKeyOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { IoIosArrowForward } from 'react-icons/io';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = 'كلمة المرور الحالية مطلوبة';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'كلمة المرور غير متطابقة';
    }

    if (formData.old_password && formData.new_password && formData.old_password === formData.new_password) {
      newErrors.new_password = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    // Debug: Show what user entered
    console.log('🔍 Form Data Check:');
    console.log('  - Old Password Length:', formData.old_password.length);
    console.log('  - Old Password (first 2 chars):', formData.old_password.substring(0, 2) + '***');
    console.log('  - New Password Length:', formData.new_password.length);
    console.log('  - Confirm Password Match:', formData.new_password === formData.confirm_password);

    try {
      // Send with correct key names (no underscores)
      const requestData = {
        oldPassword: formData.old_password,        // ✅ المفتاح الصحيح
        newPassword: formData.new_password,        // ✅ المفتاح الصحيح
        password: formData.old_password,           // للتوافق
        old_password: formData.old_password,       // للتوافق
        new_password: formData.new_password,       // للتوافق
        confirm_password: formData.confirm_password
      };

      console.log('📤 Sending password change request');
      console.log('  - oldPassword key exists:', !!requestData.oldPassword);
      console.log('  - newPassword key exists:', !!requestData.newPassword);
      console.log('  - password key exists:', !!requestData.password);
      console.log('  - old_password key exists:', !!requestData.old_password);
      console.log('  - new_password key exists:', !!requestData.new_password);
      console.log('  - confirm_password key exists:', !!requestData.confirm_password);

      const response = await postForm('/api/change-password', requestData);

      console.log('📥 Password change response:', response);
      console.log('  - Status:', response?.status);
      console.log('  - Message:', response?.msg || response?.message);

      if (response?.status) {
        setSuccessMessage('تم تغيير كلمة المرور بنجاح!');
        // Clear form
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        const errorMsg = response?.msg || response?.message || 'فشل في تغيير كلمة المرور';
        setErrors({ general: errorMsg });
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      const errorMsg = error?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoIosArrowForward className="text-2xl" style={{ color: '#0F005B' }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#0F005B15' }}>
              <IoKeyOutline className="text-2xl" style={{ color: '#0F005B' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F005B' }}>
              الأمان وكلمة المرور
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">تغيير كلمة المرور</h2>
            <p className="text-sm text-gray-600">
              يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة
            </p>
          </div>

           {/* Success Message */}
           {successMessage && (
             <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
               <p className="text-green-700 font-medium">{successMessage}</p>
             </div>
           )}

           {/* General Error */}
           {errors.general && (
             <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg">
               <p className="text-red-700 font-medium">{errors.general}</p>
             </div>
           )}

           {/* Debug Info - Remove in production */}
           {formData.old_password && (
             <div className="mb-6 p-3 bg-yellow-50 border-r-4 border-yellow-500 rounded-lg text-xs">
               <p className="font-bold text-yellow-900 mb-1">معلومات التحقق:</p>
               <ul className="text-yellow-800 space-y-1">
                 <li>• طول كلمة المرور الحالية: {formData.old_password.length} حرف</li>
                 <li>• طول كلمة المرور الجديدة: {formData.new_password.length} حرف</li>
                 <li>• التطابق: {formData.new_password === formData.confirm_password ? '✅' : '❌'}</li>
               </ul>
             </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الحالية"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.old_password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#0F005B]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.old ? (
                    <IoEyeOffOutline className="text-xl" />
                  ) : (
                    <IoEyeOutline className="text-xl" />
                  )}
                </button>
              </div>
              {errors.old_password && (
                <p className="mt-1 text-sm text-red-500">{errors.old_password}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.new_password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#0F005B]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <IoEyeOffOutline className="text-xl" />
                  ) : (
                    <IoEyeOutline className="text-xl" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.confirm_password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#0F005B]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <IoEyeOffOutline className="text-xl" />
                  ) : (
                    <IoEyeOutline className="text-xl" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
              >
                إلغاء
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isSubmitting ? undefined : '#0F005B'
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    جاري التغيير...
                  </span>
                ) : (
                  'حفظ التغييرات'
                )}
              </button>
            </div>
          </form>

          {/* Security Tips */}
         
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;

