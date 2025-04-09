// export interface Chat {
//     chatId: string;
//     chatData: any;
//     chatPartner: {
//       uid: string;
//       name:string;
//       email:string;
//       fotolink:string;
//       presenceStatus:boolean;
//     };
    
//   }
  export interface Chat {
    chatId: string;
    chatData: any;
    chatPartner: ChatPartner;
  }
  export interface ChatPartner {
    uid: string;
    name?: string;
    email?: string;
    fotolink?: string;
    presenceStatus?: boolean;
  }