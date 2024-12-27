import mongoose, { Types } from "mongoose";

export interface IPet {
  name: string;
  species: string;
  race: string;
  birthday: Date;
  picture: {
    buffer: Buffer;
    contentType: string;
  };
  user: Types.ObjectId;
}

const petSchema = new mongoose.Schema<IPet>({
  name: {
    type: String,
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  race: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  picture: {
    data: Buffer,
    contentType: String,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model<IPet>("Pet", petSchema);
