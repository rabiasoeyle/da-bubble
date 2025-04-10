export interface Message {
  uid: string;
  message: string;
  timestamp: string;
  date:any;
  clock:any;
  name?: string;
  fotolink?: string;
  editing:boolean;
  reactions:[];
  }
export interface MessageFirebase {
  uid: string;
  message: string;
  timestamp: string;
  reactions:[];
}