import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BsCheck2All } from 'react-icons/bs'
import { FiSearch } from 'react-icons/fi'
import { useDarkMode } from '../../contexts/DarkModeContext'
import { getJson } from '../../api'

// Chat list page (WhatsApp-like) with search and filter chips
function Chat() {
  const { darkMode } = useDarkMode()

  const [filter, setFilter] = useState('all') // all | unread | sell | buy
  const [query, setQuery] = useState('')

  // Rooms from API
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)
  // search users (global on list page)
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState([])
  const [userSearching, setUserSearching] = useState(false)

  // Fetch rooms from API with status/name filters
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()

    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const params = new URLSearchParams()
        // status: 0 => unread, 1 => read; omit for all
        if (filter === 'unread') params.set('status', '0')
        if (filter === 'read') params.set('status', '1')
        if (query.trim()) params.set('name', query.trim())
        const qs = params.toString()
        const url = `/api/pusher/rooms${qs ? `?${qs}` : ''}`
        console.log('📡 [rooms] GET', url)
        const res = await getJson(url, { signal: controller.signal })
        console.log('📦 [rooms] full response:', res)
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        console.log('✅ [rooms] response items:', Array.isArray(data) ? data.length : 'n/a')
        if (data.length > 0) console.log('📋 [rooms] first item sample:', data[0])
        if (!ignore) setRooms(data)
      } catch (e) {
        console.error('❌ [rooms] error:', e)
        if (!ignore && e.name !== 'AbortError') setError('تعذر تحميل الدردشات')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    const t = setTimeout(run, 250) // debounce البحث
    return () => { ignore = true; controller.abort(); clearTimeout(t) }
  }, [filter, query, refreshTick])

  // Refresh rooms when الرجوع للصفحة أو عند استعادة التركيز
  useEffect(() => {
    const trigger = () => setRefreshTick(t => t + 1)
    window.addEventListener('focus', trigger)
    const onVis = () => { if (!document.hidden) trigger() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('focus', trigger)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Search users within a room (use first room by default if exists)
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    const run = async () => {
      if (!userSearch.trim()) { setUserResults([]); return }
      const firstRoomId = rooms[0]?.room_id || rooms[0]?.id || rooms[0]?._id
      try {
        setUserSearching(true)
        const params = new URLSearchParams({ search: userSearch.trim() })
        if (firstRoomId) params.set('room_id', firstRoomId)
        const url = `/api/pusher/search-users?${params.toString()}`
        console.log('🔎 [search-users] GET', url)
        const res = await getJson(url, { signal: controller.signal })
        console.log('🔍 [search-users] full response:', res)
        const list = Array.isArray(res?.users) ? res.users : []
        console.log('✅ [search-users] results:', list.length, list)
        if (!ignore) setUserResults(list)
      } catch (_) {
        console.error('❌ [search-users] error')
        if (!ignore) setUserResults([])
      } finally {
        if (!ignore) setUserSearching(false)
      }
    }
    const t = setTimeout(run, 300)
    return () => { ignore = true; controller.abort(); clearTimeout(t) }
  }, [userSearch, rooms])

  // Map API rooms to UI model
  const filtered = useMemo(() => {
    return rooms.map(r => {
      // Extract last message text (handle both string and object)
      let lastText = ''
      if (typeof r.last_message === 'string') {
        lastText = r.last_message
      } else if (r.last_message?.message) {
        lastText = r.last_message.message
      } else if (typeof r.last_msg === 'string') {
        lastText = r.last_msg
      } else if (r.last_msg?.message) {
        lastText = r.last_msg.message
      }

      // Extract other user info
      const otherUser = r.other_user || {}
      const userName = otherUser.name || r.name || r.user_name || 'مستخدم'
      const userAvatar = otherUser.img || r.avatar || r.image || 'https://i.pravatar.cc/80?img=12'
      const userId = otherUser.id || r.user_id || r.receiver_id || r.partner_id || r.other_user_id

      return {
        id: r.id || r.room_id || r._id,
        name: userName,
        lastText,
        time: r.updated_at_human || r.time || '',
        avatar: userAvatar,
        unread: r.unread_count > 0 || r.status === 0 || r.unread === 1,
        roomId: r.room_id || r.id || r._id,
        userId: userId,
      }
    })
  }, [rooms])

  const chipBase = 'px-3 py-1.5 rounded-full text-sm border transition-colors'
  const chipActive = 'bg-primary text-white border-primary'
  const chipIdle = `${darkMode ? 'text-gray-200 border-gray-600 hover:border-gray-400' : 'text-gray-700 border-gray-300 hover:border-gray-500'}`

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen`} dir="rtl">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Rooms */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <FiSearch className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 bg-transparent focus:outline-none text-sm ${darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
            placeholder="البحث عن دردشه"
          />
        </div>

        {/* Search Users (global quick start) */}
        <div className={`rounded-xl p-3 mb-3 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-xs mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}">ابحث عن مستخدم لبدء محادثة</div>
          <div className="flex items-center gap-2">
            <FiSearch className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className={`flex-1 bg-transparent focus:outline-none text-sm ${darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
              placeholder="ابحث باسم مثل: احمد"
            />
          </div>
          {userSearching && <div className={`text-xs mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري البحث...</div>}
          {userResults.length > 0 && (
            <div className={`mt-2 divide-y rounded-lg overflow-hidden ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {userResults.slice(0,6).map(u => (
                <Link key={u.id} to={`/chat/${u.id}`} state={{ name: u.name, avatar: u.img, receiver_id: u.id, room_id: rooms[0]?.room_id || rooms[0]?.id }} className={`flex items-center gap-3 px-2 py-2 hover:bg-primary/10`}>
                  <img src={u.img} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="text-sm">{u.name}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2 mb-3">
          <button className={`${chipBase} ${filter==='all'?chipActive:chipIdle}`} onClick={() => setFilter('all')}>الكل</button>
          <button className={`${chipBase} ${filter==='unread'?chipActive:chipIdle}`} onClick={() => setFilter('unread')}>غير مقروء</button>
          <button className={`${chipBase} ${filter==='sell'?chipActive:chipIdle}`} onClick={() => setFilter('sell')}>بيع</button>
          <button className={`${chipBase} ${filter==='buy'?chipActive:chipIdle}`} onClick={() => setFilter('buy')}>شراء</button>
        </div>

        {/* List */}
        <div className={`divide-y rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100 border border-gray-100'}`}>
          {loading && (
            <div className={`p-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري التحميل...</div>
          )}
          {error && !loading && (
            <div className="p-4 text-center text-red-600">{error}</div>
          )}
          {!loading && !error && filtered.map((c) => (
            <Link key={c.id} to={`/chat/${c.id}`} state={{ name: c.name, avatar: c.avatar, room_id: c.roomId, receiver_id: c.userId }} className={`flex items-center p-3 hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
              {/* Avatar + text together (right side in RTL) */}
              <div className="flex items-center gap-3">
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm truncate`}>{c.lastText}</div>
                </div>
              </div>
              {/* spacer to push time to far left */}
              <div className="grow" />
              {/* time + read (left side) */}
              <div className="text-[11px] text-gray-500 flex flex-col items-start w-16 text-left">
                <span>{c.time}</span>
                <BsCheck2All className={`${c.unread ? 'text-gray-400' : 'text-primary'}`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Chat


