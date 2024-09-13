import { Chat } from '../entities/chat.entity';

export class ChatResponseDTO {
  id: string;
  name: string;
  minValue: number;
  filterPrompt: string;
  token: string;
  isActive: boolean;
  constructor(args: Chat) {
    this.id = args.id;
    this.name = args.name;
    this.minValue = args.minValue;
    this.filterPrompt = args.filterPrompt;
    this.token = args.token;
    this.isActive = args.isActive;
  }
}