import { User } from '../entities/user.entity';

export class UserResponseDTO {
  fullName: string;
  email: string;
  profileImage: string;
  emailVerified: boolean;
  phone: string | undefined;
  document: string;

  constructor(args: User) {
    this.fullName = args.fullName;
    this.email = args.email;
    this.profileImage = args.profileImage;
    this.emailVerified = args.emailVerified;
    this.phone = args.phone;
    this.document = args.document;
  }
}