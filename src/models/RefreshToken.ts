import mongoose from "mongoose";

export interface IRefreshToken {
  refreshToken: string;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
