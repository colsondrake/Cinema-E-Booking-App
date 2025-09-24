import mongoose, { Schema, Document, Model } from "mongoose";

// Create the interface for promotion
interface IPromotion extends Document {
    // PROMOTION DETAILS TO BE ADDED
}

// Promotion schema to hold data members in a promotion
const promotionSchema = new Schema<IPromotion>({
    // PROMOTION DETAILS TO BE ADDED
});

// Construct the model and export it for use
const Promotion: Model<IPromotion> = mongoose.models.Promotion || mongoose.model<IPromotion>("Promotion", promotionSchema);
export default Promotion;