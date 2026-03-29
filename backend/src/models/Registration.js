import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
	status: { type: String, enum: ['registered', 'cancelled', 'waitlisted'], default: 'registered' },
	registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;

