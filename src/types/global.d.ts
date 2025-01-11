declare namespace Express {
  export interface Request {
    user?: { _id: string };
    pet?: PetDocument;
    task?: TaskDocument;
    petWeightRecord?: PetWeightRecord;
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
