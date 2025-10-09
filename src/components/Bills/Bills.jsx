import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJson } from '../../api';
import { IoIosArrowForward } from 'react-icons/io';
import { LuFileSpreadsheet } from 'react-icons/lu';
import { FiCalendar, FiDollarSign, FiFileText } from 'react-icons/fi';

function Bills() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('api_token');
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('📄 Fetching bills for current user...');
      const response = await getJson('/api/user/bills');
      
      console.log('📄 Bills response:', response);
      console.log('📄 Response structure:', {
        hasStatus: !!response?.status,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        hasDataData: !!response?.data?.data,
        dataDataType: Array.isArray(response?.data?.data) ? 'Array' : typeof response?.data?.data
      });

      if (response?.status) {
        // Handle paginated response (data.data)
        if (response.data?.data && Array.isArray(response.data.data)) {
          setBills(response.data.data);
          console.log('✅ Loaded', response.data.data.length, 'bills from data.data');
          
          // Debug: Print first bill structure
          if (response.data.data.length > 0) {
            console.log('📋 First bill sample:', response.data.data[0]);
            console.log('  - Keys:', Object.keys(response.data.data[0]));
          }
        } 
        // Handle direct array response
        else if (Array.isArray(response.data)) {
          setBills(response.data);
          console.log('✅ Loaded', response.data.length, 'bills from data');
        }
        // Handle bills property
        else if (response.bills && Array.isArray(response.bills)) {
          setBills(response.bills);
          console.log('✅ Loaded', response.bills.length, 'bills from bills property');
        }
        else {
          setBills([]);
          console.warn('⚠️ No bills found in response');
        }
      } else {
        const errorMsg = response?.msg || response?.message || 'فشل في تحميل الفواتير';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error fetching bills:', err);
      setError('حدث خطأ أثناء تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return parseFloat(amount).toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get status badge - All bills in the system are paid
  const getStatusBadge = (bill) => {
    // If bill exists in user's bills, it means it's paid (completed transaction)
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        مدفوع
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
          <p className="mt-4 text-gray-600">جاري تحميل فواتيرك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoIosArrowForward className="text-2xl text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#0F005B15' }}>
              <LuFileSpreadsheet className="text-2xl" style={{ color: '#0F005B' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                فواتيري
              </h1>
              <p className="text-sm text-gray-600">جميع الفواتير والمدفوعات</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* No bills */}
        {bills.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <LuFileSpreadsheet className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد فواتير</h3>
            <p className="text-gray-600">لم تقم بأي عمليات دفع بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Bill Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0F005B15' }}>
                        <FiFileText className="text-xl" style={{ color: '#0F005B' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {bill.name_ar || bill.name_en || bill.product || 'فاتورة'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          رقم الفاتورة: #{bill.id}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {/* Date */}
                      {bill.created_at && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          <span>{formatDate(bill.created_at)}</span>
                        </div>
                      )}

                      {/* Package Name */}
                      {bill.package && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiFileText className="text-gray-400" />
                          <span>{bill.package}</span>
                        </div>
                      )}

                      {/* Product */}
                      {bill.product && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiFileText className="text-gray-400" />
                          <span>المنتج: {bill.product}</span>
                        </div>
                      )}

                      {/* Payment Method */}
                      {bill.payment_method && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiDollarSign className="text-gray-400" />
                          <span>طريقة الدفع: {bill.payment_method}</span>
                        </div>
                      )}

                      {/* Type */}
                      {bill.type && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiFileText className="text-gray-400" />
                          <span>النوع: {bill.type}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="flex md:flex-col items-center md:items-end gap-3">
                    {/* Status */}
                    {getStatusBadge(bill)}
                    
                    {/* Amount */}
                    {bill.price && (
                      <div className="text-center md:text-left">
                        <p className="text-sm text-gray-500 mb-1">المبلغ</p>
                        <p className="text-2xl font-bold" style={{ color: '#0F005B' }}>
                          {formatCurrency(bill.price)} د.ك
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {bill.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{bill.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
       
      </div>
    </div>
  );
}

export default Bills;

