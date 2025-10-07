import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { IoIosSend, IoIosArrowBack } from 'react-icons/io'
import { useDarkMode } from '../../contexts/DarkModeContext'
import { postJson, getJson } from '../../api'

function ChatRoom() {
  const { chatId } = useParams()
  const location = useLocation()
  const [headerName, setHeaderName] = useState(location.state?.name || `محادثة #${chatId}`)
  const [headerAvatar, setHeaderAvatar] = useState(location.state?.avatar || 'https://i.pravatar.cc/80?img=12')
  const roomId = location.state?.room_id
  const { darkMode } = useDarkMode()
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const [receiverId, setReceiverId] = useState(location.state?.receiver_id || location.state?.user_id || null)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  // Load messages from API (if roomId available)
  useEffect(() => {
    let ignore = false
    const loadMessages = async () => {
      if (!roomId) return
      try {
        setLoadingMessages(true)
        console.log('📨 [messages] GET /api/pusher/messages?room_id=', roomId)
        const res = await getJson(`/api/pusher/messages?room_id=${roomId}`)
        console.log('✅ [messages] response:', res)
        const msgs = Array.isArray(res?.messages) ? res.messages : (Array.isArray(res?.data) ? res.data : [])
        if (!ignore) {
          const formatted = msgs.map(m => ({
            id: m.id,
            from: m.is_from_me ? 'me' : 'them',
            text: m.message,
            raw: m
          }))
          setMessages(formatted)
        }
      } catch (e) {
        console.error('❌ [messages] error:', e)
      } finally {
        if (!ignore) setLoadingMessages(false)
      }
    }
    loadMessages()
    return () => { ignore = true }
  }, [roomId])

  // Mark room as read on open (if roomId available)
  useEffect(() => {
    const markAsRead = async () => {
      try {
        if (!roomId) return
        console.log('📩 [mark-read] POST /api/pusher/mark-read', { room_id: roomId })
        const res = await postJson('/api/pusher/mark-read', { room_id: roomId })
        console.log('✅ [mark-read] response:', res)
      } catch (_) {}
    }
    markAsRead()
  }, [roomId])

  // Search users in this room
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    const run = async () => {
      if (!roomId || !search.trim()) { setResults([]); return }
      try {
        setSearching(true)
        const params = new URLSearchParams({ room_id: roomId, search: search.trim() })
        const res = await getJson(`/api/pusher/search-users?${params.toString()}`, { signal: controller.signal })
        const list = Array.isArray(res?.users) ? res.users : []
        if (!ignore) setResults(list)
      } catch (_) {
        if (!ignore) setResults([])
      } finally {
        if (!ignore) setSearching(false)
      }
    }
    const t = setTimeout(run, 300)
    return () => { ignore = true; controller.abort(); clearTimeout(t) }
  }, [roomId, search])

  const send = async () => {
    const t = input.trim()
    if (!t || sending) return
    if (!receiverId) {
      setError('لا يوجد معرف مستلم receiver_id')
      return
    }
    setError('')
    setSending(true)

    // Use receiverId from state (can come from link state or search result)
    try {
      // Optimistic UI
      const tempId = Date.now()
      setMessages(prev => [...prev, { id: tempId, from: 'me', text: t }])
      setInput('')

      // Call API
      const payload = { receiver_id: receiverId, message: t, message_type: 'text' }
      console.log('✉️ [send] POST /api/pusher/send', payload)
      const res = await postJson('/api/pusher/send', payload)
      console.log('✅ [send] response:', res)

      // If API returns message object, update optimistic message with real data
      if (res?.message) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { 
                id: res.message.id || tempId, 
                from: 'me', 
                text: res.message.message || t,
                raw: res.message
              }
            : msg
        ))
      }
    } catch (e) {
      setError(e.message || 'تعذر إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen`} dir="rtl">
      <div className="max-w-md mx-auto h-[100vh] flex flex-col">
        <header className={`px-4 py-3 border-b sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
          <div className="flex items-center gap-3">
          <Link to="/chat" className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <IoIosArrowBack />
          </Link>
          <img src={headerAvatar} alt={headerName} className="w-10 h-10 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="font-bold truncate">{headerName}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>متصل الآن</div>
          </div>
          </div>
          <div className="mt-3">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} className={`w-full text-sm rounded-lg px-3 py-2 border focus:outline-none ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`} placeholder="ابحث عن مستخدم لإرسال رسالة" />
            {searching && <div className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>جاري البحث...</div>}
            {results.length>0 && (
              <div className={`mt-2 rounded-lg border max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                {results.map(u => (
                  <button key={u.id} onClick={()=>{ setReceiverId(u.id); setHeaderName(u.name||'مستخدم'); setHeaderAvatar(u.img||headerAvatar); setSearch(''); setResults([]) }} className="w-full text-right px-3 py-2 flex items-center gap-3 hover:bg-primary/10">
                    <img src={u.img} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm">{u.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <main ref={listRef} className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {loadingMessages && (
            <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>جاري تحميل الرسائل...</div>
          )}
          {!loadingMessages && messages.length === 0 && (
            <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>لا توجد رسائل بعد. ابدأ المحادثة!</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.from === 'me' ? 'bg-primary text-white' : darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow`}> {m.text} </div>
            </div>
          ))}
          {error && (
            <div className="text-red-600 text-xs text-center mt-2">{error}</div>
          )}
        </main>

        <footer className={`p-3 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
              placeholder="اكتب رسالتك..."
            />
            <button onClick={send} disabled={sending} className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 ${sending ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
              <IoIosSend />
              {sending ? 'جاري الإرسال...' : 'ارسال'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ChatRoom


