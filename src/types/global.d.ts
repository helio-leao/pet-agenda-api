declare namespace Express {
  export interface Request {
    user?: { _id: string };
    pet?: PetDocument;
    task?: TaskDocument;
    petWeightRecord?: PetWeightRecord;
    taskDoneRecord?: TaskDoneRecord;
  }
}

type TaskDocument = Document<unknown, {}, ITask> &
  ITask & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

type PetDocument = Document<unknown, {}, IPetWeightRecord> &
  IPetWeightRecord & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

type PetWeightRecord = Document<unknown, {}, IPetWeightRecord> &
  IPetWeightRecord & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

type TaskDoneRecord = Document<unknown, {}, ITaskDoneRecord> &
  ITaskDoneRecord & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };
