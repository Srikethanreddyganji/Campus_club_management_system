import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, default: '' },
	date: { type: Date, required: true },
	location: { type: String, required: true },
	clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;

