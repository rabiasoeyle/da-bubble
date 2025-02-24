import { Message } from "./messages";

export interface Channel {
    name: string;
    description: string;
    messages: Message[];
    created:{
      createdFrom:any;
      createdAt:string;
    };
    members:any[];
    membersAmount:number;
  }