export type Report = {
    id: number;
    content: string;
    title: string;
    created_at: string;
    user?: User;
    user_id: number;
    weights ?: number[]; // Assuming weights is an array of numbers
    zone: string;
    brick_type: string;
  
    // add more fields if necessary
  };
  export type RootStackParamList = {
    Login: undefined; 
    Register: undefined;
    AjouterReport: undefined;
    ReportDetail: { report: Report};
    ReportForm: { report: Report};
    Home: { newReport: any } | undefined;
  };
  export interface User {
    id: number;
    name: string;
    email?: string;
    // other user fields...
  }
  
