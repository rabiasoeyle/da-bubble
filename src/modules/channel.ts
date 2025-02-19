export interface Channel {
    name: string;
    description: string;
    messages: any[];
    created:{
      createdFrom:any;
      createdAt:string;
    };
    members:any[];
    membersAmount:number;
  }