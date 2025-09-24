import mongoose, { Schema, Document, Model } from "mongoose";

// Create the interface for payment card
interface IPaymentCard extends Document {
    userID: mongoose.Types.ObjectId;
    cardType: string;
    cardNumber: string;
    expirationDate: string;
    billingAddress: string;
}

// Payment schema to hold data members in a payment card
const paymentCardSchema = new Schema<IPaymentCard>({
    userID: {
        type: Schema.Types.ObjectId, ref: "User",
        required: true,
    },
    cardType: {
        type: String,
        required: true,
    },
    cardNumber: {
        type: String,
        required: true,
    },
    expirationDate: {
        type: String,
        required: true,
    },
    billingAddress: {
        type: String,
        required: true,
    },
});

// Construct the model and export it for use
const PaymentCard: Model<IPaymentCard> = mongoose.models.PaymentCard || mongoose.model<IPaymentCard>("PaymentCard", paymentCardSchema);
export default PaymentCard;