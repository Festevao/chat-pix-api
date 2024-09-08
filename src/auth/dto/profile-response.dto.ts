export class ProfileResponseDTO {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  emailVerified: boolean;

  constructor(args: ProfileResponseDTO) {
    this.fullName = args.fullName;
    this.email = args.email;
    this.phone = args.phone;
    this.document = args.document;
    this.emailVerified = args.emailVerified;
  }
}