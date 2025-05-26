export type SubReport = {
  id: number;
  zone: string;
  brick_type: string;
  weights: number[] | string; // can be array or stringified array
  average_weight: number;
  datetime?: string;
  shift?: string;
};

export type Report = {
  id: number;
  content: string | null;
  title: string | null;
  created_at: string;
  user?: User;
  user_id: number;
  weights?: number[];
  zone?: string;
  brick_type?: string;
  shift?: string;
  subreports?: SubReport[];
  datetime?: string;
  averageWeight?: number;
  locked?: boolean;
  username:string;
  date:string;
  time:string;

};
  export type RootStackParamList = {
    Login: undefined; 
    Register: undefined;
    AjouterReport: { editingReport?: any }| undefined;
    ReportDetail: { report: Report};
    ReportForm: { report: Report};
    Home: { username?: string;newReport?: any; updatedReport?: any }| undefined;
    EditReport: { report: Report };
    AllReports: undefined;
    updatedReport: Report;
    ListDePoids: undefined;
  };
  export interface User {
    id: number;
    name: string;
    email?: string;
    // other user fields...
  }

export type BrickType = 'B8-25' | 'B10' | 'B12' | null;
  
