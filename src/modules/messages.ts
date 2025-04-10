export interface Message {
  uid: string;
  message: string;
  timestamp: string;
  date:any;
  clock:any;
  name?: string;
  fotolink?: string;
  editing:boolean;
  reactions:Reaction[];
  }
export interface MessageFirebase {
  uid: string;
  message: string;
  timestamp: string;
  reactions:[];
}
export interface Reaction {
  senderUid: string;
  reaction: any;
}