import mongoose, { Schema } from "mongoose";
import { IFavorite } from "./../types/index";

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealId: {
      type: String,
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    mealImage: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

favoriteSchema.index(
  {
    user: 1,
    mealId: 1,
  },
  { unique: true },
);

export default mongoose.model<IFavorite>("Favorite", favoriteSchema);
