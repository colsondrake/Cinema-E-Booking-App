import mongoose, { Schema, Document, Model } from "mongoose";

// Create the interface for user
interface IUser extends Document {
    ID: string;
    name: string;
    phoneNumber: string;
    email: string;
    password: string;
    homeAddress: string;
    paymentInformation?: mongoose.Types.ObjectId[];
}

// User schema to hold data members in a user
const userSchema = new Schema<IUser>({
    ID: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    homeAddress: {
        type: String,
        required: false,
    },
    paymentInformation: {
        type: Schema.Types.ObjectId, ref: "PaymentCard",
        required: false,
    },
});

// Construct the model and export it for use
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;