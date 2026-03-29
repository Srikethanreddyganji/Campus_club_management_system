import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true, unique: true },
	description: { type: String, default: '' },
	adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Club = mongoose.model('Club', clubSchema);
export default Club;

