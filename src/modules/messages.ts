export interface Message {
    uid: string;
    message: string;
    timestamp: string;
    username?: string;
    fotolink?: string;
    editing:boolean;
  }