declare namespace Express {
  export interface Request {
    user?: { _id: string };
    pet?: any;
    task?: any;
    petWeightRecord?: any;
    taskDoneRecord?: any;
  }
}
