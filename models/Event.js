const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Core Fields
    title:              { type: String, required: true, trim: true },
    category:           { type: String, required: true, enum: ['Workshop', 'Seminar', 'Concert', 'Sports', 'Cultural', 'Other'] },
    description:        { type: String, required: true },

    // Date & Time
    date:               { type: Date, required: true },
    startTime:          { type: String, default: '' },
    endTime:            { type: String, default: '' },
    registrationDeadline: { type: Date },

    // Location
    location:           { type: String, required: true, trim: true },

    // Organizer & Contact
    organizerName:      { type: String, default: '' },
    contactEmail:       { type: String, default: '' },
    contactPhone:       { type: String, default: '' },
    speakerName:        { type: String, default: '' },

    // Capacity
    maxSeats:           { type: Number, required: true, min: 1 },
    availableSeats:     { type: Number, required: true },

    // Image
    image:              { type: String, default: 'default-event.jpg' },

    // Status — 'pending' = awaiting admin approval, 'approved' = live on site
    // eventStatus = lifecycle (Upcoming / Ongoing / Completed)
    status:             { type: String, enum: ['pending', 'approved'], default: 'pending' },
    eventStatus:        { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },

    // Relations
    organizer:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdAt:          { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
