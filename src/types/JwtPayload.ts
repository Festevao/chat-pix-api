export interface JWTPayload {
  sub: string,
  fullName: string,
  email: string,
  phone: string,
  document: string,
  emailVerified: boolean,
  isGoogleLogin: boolean,
  iat: number,
	exp: number,
}