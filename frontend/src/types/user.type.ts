export type User = {
    id: string
    full_name: string
    email: string
    password: string
    password_reset_token: string
    refresh_token: string
    remember_me_token: string
    email_confirmation_token: string
    email_confirmed_at: string
    email_verified: boolean
    role: string
    created_at: string
    updated_at: string
    twofa_code: string
    twofa_expires_at: string
    twofa_attempts: number
}