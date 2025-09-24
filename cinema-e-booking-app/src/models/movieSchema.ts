import mongoose, { Schema, Document, Model } from "mongoose";

// Create the interface for movie
interface IMovie extends Document {
    title: string;
    releaseDate: number;
    genre: string;
    rating: string;
    director: string;
    description: string;
    trailer: string;
    showtimes: string[];
}

// Movie schema to hold data members in a movie
const movieSchema = new Schema<IMovie>({
    title: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    rating: {
        type: String,
        required: true,
    },
    director: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    trailer: {
        type: String,
        required: true,
    },
    showtimes: {
        type: [String],
        required: true,
    },
});

// Construct the model and export it for use
const Movie: Model<IMovie> = mongoose.models.Movie || mongoose.model<IMovie>("Movie", movieSchema);
export default Movie;
