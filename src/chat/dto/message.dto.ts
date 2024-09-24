export class MessageUserDTO {
  fullName: string;
  profileImage?: string;
  nick: string;

  constructor(args: MessageUserDTO) {
    this.fullName = args.fullName;
    this.profileImage = args.profileImage;
    this.nick = args.nick;
  }
}

export class MessageDTO {
  message: string;
  value: number;
  date: Date;
  chatName: string;
  chatMinValue: number;
  payer: MessageUserDTO;

  constructor(agrs: MessageDTO) {
    this.message = agrs.message;
    this.value = agrs.value;
    this.date = agrs.date;
    this.chatName = agrs.chatName;
    this.chatMinValue = agrs.chatMinValue;
    this.payer = new MessageUserDTO(agrs.payer);
  }
}

export class PaginatedMessagesDTO {
  messages: MessageDTO[];
  page: number;
  pageSize: number;
  hasNext: boolean;

  constructor(args: PaginatedMessagesDTO) {
    this.messages = args.messages;
    this.page = args.page;
    this.pageSize = args.pageSize;
    this.hasNext = args.hasNext;
  }
}