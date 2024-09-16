import { User } from '../entities/user.entity';

export class UserResponseDTO {
  fullName: string;
  email: string;
  nick: string;
  profileImage: string;
  emailVerified: boolean;
  phone: string | undefined;
  document: string;

  constructor(args: User, options?: { hidePrivInfos: boolean }) {
    this.fullName = args.fullName;
    this.email = args.email;
    this.profileImage = args.profileImage;
    this.nick = args.nick;

    this.emailVerified = options?.hidePrivInfos ? undefined : args.emailVerified;
    this.phone = options?.hidePrivInfos ? undefined : args.phone;
    this.document = options?.hidePrivInfos ? undefined : args.document;
  }
}