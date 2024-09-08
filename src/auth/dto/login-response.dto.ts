export class LoginResponseDTO {
  access_token: string;
  refresh_token: string;
  expires_in: number;

  constructor(args: LoginResponseDTO) {
    this.access_token = args.access_token;
    this.refresh_token = args.refresh_token;
    this.expires_in = args.expires_in;
  }
}