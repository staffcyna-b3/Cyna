const FRONT_AUTH_KEY = "frontoffice:isAuthenticated"
const FRONT_PROFILE_KEY = "frontoffice:userProfile"
const FRONT_TOKEN_KEY = "frontoffice:token"
// UI display only — never use for API calls or access control
// User identity is managed server-side by the gateway
const FRONT_SESSION_KEY = "frontoffice:session"

export type FrontUserProfile = {
  fullName?: string
  address: string
  city: string
  postalCode: string
}

export type FrontSession = {
  userId: string
  email: string
  fullName?: string
}

export const isFrontAuthenticated = () => {
  if (localStorage.getItem(FRONT_AUTH_KEY) === "true") {
    return true
  }

  return Boolean(localStorage.getItem(FRONT_SESSION_KEY))
}

export const setFrontAuthenticated = (isAuthenticated: boolean) => {
  localStorage.setItem(FRONT_AUTH_KEY, String(isAuthenticated))
}

export const getFrontToken = () => {
  return localStorage.getItem(FRONT_TOKEN_KEY)
}

export const setFrontToken = (token: string) => {
  localStorage.setItem(FRONT_TOKEN_KEY, token)
}

export const getFrontSession = (): FrontSession | null => {
  const rawSession = localStorage.getItem(FRONT_SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as FrontSession
  } catch {
    return null
  }
}

export const setFrontSession = (session: FrontSession) => {
  localStorage.setItem(FRONT_SESSION_KEY, JSON.stringify(session))
  setFrontAuthenticated(true)
}

export const getFrontUserProfile = (): FrontUserProfile | null => {
  const profile = localStorage.getItem(FRONT_PROFILE_KEY)

  if (!profile) {
    return null
  }

  try {
    return JSON.parse(profile) as FrontUserProfile
  } catch {
    return null
  }
}

export const setFrontUserProfile = (profile: FrontUserProfile) => {
  localStorage.setItem(FRONT_PROFILE_KEY, JSON.stringify(profile))
}

export const clearFrontSession = () => {
  localStorage.removeItem(FRONT_SESSION_KEY)
  localStorage.removeItem(FRONT_TOKEN_KEY)
  localStorage.removeItem(FRONT_PROFILE_KEY)
  localStorage.setItem(FRONT_AUTH_KEY, "false")
}
