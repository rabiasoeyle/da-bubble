export interface Chat {
    chatId: string;
    chatData: any;
    chatPartner: {
      uid: string;
      name:string;
      email:string;
      fotolink:string;
    };
  }