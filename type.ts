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
    shift: string;
    subreports?: Report[]; // Assuming subreports is an array of Report objects
  
    // add more fields if necessary
  };
  export type RootStackParamList = {
    Login: undefined; 
    Register: undefined;
    AjouterReport: { editingReport?: any }| undefined;
    ReportDetail: { report: Report};
    ReportForm: { report: Report};
    Home: { newReport?: any; updatedReport?: any }| undefined;
    EditReport: { report: Report };
    AllReports: undefined;
    updatedReport: Report;
    
  };
  export interface User {
    id: number;
    name: string;
    email?: string;
    // other user fields...
  }
  export type Subreport = {
  zone: string | null;
  brickType: BrickType | null;
  weights: string[];
  averageWeight: string;
};
export type BrickType = 'B8-25' | 'B10' | 'B12' | null;
  
