import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
mongooseAggregatePaginate;
const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: [true, "Video is Required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is Required"],
    },
    title: {
      type: String,
      required: [true, "Title is Required"],
      minLength: [3, "Title must be at least 3 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is Required"],
      minLength: [3, "Description must be at least 3 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is Required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);
