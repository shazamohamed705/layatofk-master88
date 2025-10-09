// Lightweight API client with timeout and environment-aware base URL
export async function postForm(path, formParams, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? 10000
  const id = setTimeout(() => controller.abort(), timeoutMs)

  const apiBase = process.env.NODE_ENV === 'development' ? '' : 'https://lay6ofk.com'
  const url = `${apiBase}${path}`

  // Get token for Authorization header
  let token = null
  if (!options.skipToken) {
    try {
      token = localStorage.getItem('api_token')
      if (token) {
        token = token.trim()
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] Error accessing token:', e.message)
      }
    }
  }

  try {
    const body = typeof formParams === 'string' ? formParams : new URLSearchParams(formParams).toString()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: body,
      signal: controller.signal,
    })

    const isJson = (response.headers.get('content-type') || '').includes('application/json')
    const payload = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      const serverMsg = typeof payload === 'string' ? payload : (payload?.msg || payload?.message || '')
      throw new Error(serverMsg || `Request failed with status ${response.status}`)
    }

    return payload
  } finally {
    clearTimeout(id)
  }
}

// GET JSON helper - token in Authorization header
export async function getJson(path, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? 10000
  const id = setTimeout(() => controller.abort(), timeoutMs)

  const apiBase = process.env.NODE_ENV === 'development' ? '' : 'https://lay6ofk.com'
  const url = `${apiBase}${path}`

  // Get token for Authorization header (unless explicitly disabled)
  let token = null
  if (options.includeToken !== false) {
    try {
      token = localStorage.getItem('api_token')
      if (token) {
        token = token.trim()
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] Error accessing token:', e.message)
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] 🔓 Skipping token for:', path)
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })

    const isJson = (response.headers.get('content-type') || '').includes('application/json')
    const payload = isJson ? await response.json() : await response.text()
    if (!response.ok) {
      const serverMsg = typeof payload === 'string' ? payload : (payload?.msg || payload?.message || '')
      throw new Error(serverMsg || `Request failed with status ${response.status}`)
    }
    return payload
  } finally {
    clearTimeout(id)
  }
}

// Multipart POST for file uploads
export async function postMultipart(path, formData, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? 20000
  const id = setTimeout(() => controller.abort(), timeoutMs)

  const apiBase = process.env.NODE_ENV === 'development' ? '' : 'https://lay6ofk.com'
  const url = `${apiBase}${path}`

  // Get token for Authorization header
  let token = null
  try {
    token = localStorage.getItem('api_token')
    if (token) {
      token = token.trim()
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Error accessing token:', e.message)
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type; browser will set proper multipart boundary
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: formData,
      signal: controller.signal,
    })

    const isJson = (response.headers.get('content-type') || '').includes('application/json')
    const payload = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      const serverMsg = typeof payload === 'string' ? payload : (payload?.msg || payload?.message || '')
      throw new Error(serverMsg || `Request failed with status ${response.status}`)
    }

    return payload
  } finally {
    clearTimeout(id)
  }
}

// POST JSON data
export async function postJson(path, jsonData, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? 20000
  const id = setTimeout(() => controller.abort(), timeoutMs)

  const apiBase = process.env.NODE_ENV === 'development' ? '' : 'https://lay6ofk.com'
  const url = `${apiBase}${path}`

  // Get token for Authorization header
  let token = null
  try {
    token = localStorage.getItem('api_token')
    if (token) {
      token = token.trim()
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Error accessing token:', e.message)
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: JSON.stringify(jsonData),
      signal: controller.signal,
    })

    const isJson = (response.headers.get('content-type') || '').includes('application/json')
    const payload = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      const serverMsg = typeof payload === 'string' ? payload : (payload?.msg || payload?.message || '')
      throw new Error(serverMsg || `Request failed with status ${response.status}`)
    }

    return payload
  } finally {
    clearTimeout(id)
  }
}


