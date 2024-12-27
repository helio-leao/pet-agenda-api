import mongoose, { Types } from "mongoose";

export interface IPet {
  name: string;
  type: string;
  breed: string;
  birthdate: Date;
  picture: {
    buffer: Buffer;
    contentType: string;
  };
  user: Types.ObjectId;
}

const petSchema = new mongoose.Schema<IPet>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    birthdate: {
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPet>("Pet", petSchema);
