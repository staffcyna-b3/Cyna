const FRONT_AUTH_KEY = "frontoffice:isAuthenticated"
const FRONT_PROFILE_KEY = "frontoffice:userProfile"

export type FrontUserProfile = {
  fullName?: string
  address: string
  city: string
  postalCode: string
}

export const isFrontAuthenticated = () => {
  return localStorage.getItem(FRONT_AUTH_KEY) === "true"
}

export const setFrontAuthenticated = (isAuthenticated: boolean) => {
  localStorage.setItem(FRONT_AUTH_KEY, String(isAuthenticated))
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
