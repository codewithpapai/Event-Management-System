const Event        = require('../models/Event');
const Registration = require('../models/Registration');

function extractEventFields(body, file) {
    const image    = file ? file.filename : 'default-event.jpg';
    const maxSeats = parseInt(body.maxSeats) || 1;
    return {
        title:                body.title,
        category:             body.category,
        description:          body.description,
        date:                 body.date,
        startTime:            body.startTime            || '',
        endTime:              body.endTime              || '',
        registrationDeadline: body.registrationDeadline || null,
        location:             body.location,
        organizerName:        body.organizerName        || '',
        contactEmail:         body.contactEmail         || '',
        contactPhone:         body.contactPhone         || '',
        speakerName:          body.speakerName          || '',
        maxSeats,
        availableSeats:       maxSeats,
        eventStatus:          body.eventStatus          || 'Upcoming',
        image
    };
}

// ── User: Create Event ───────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
    try {
        const data    = extractEventFields(req.body, req.file);
        data.status   = 'pending';
        data.organizer = req.user._id;
        await Event.create(data);
        res.redirect('/dashboard?msg=Event+submitted+for+admin+review!&type=success');
    } catch (err) {
        console.error('createEvent error:', err.message);
        res.redirect('/events/create?msg=Failed+to+create+event.+Check+all+fields.&type=error');
    }
};

// ── Public: Get All Approved Events ─────────────────────────────────────────
exports.getAllEvents = async (req, res) => {
    try {
        const query = { status: 'approved' };
        if (req.query.search) {
            query.$or = [
                { title:    { $regex: req.query.search, $options: 'i' } },
                { location: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.category && req.query.category !== 'all') {
            query.category = req.query.category;
        }
        const events = await Event.find(query).sort({ date: 1 });
        res.render('event-list', { events, search: req.query.search || '', user: req.user });
    } catch (err) {
        console.error('getAllEvents error:', err.message);
        res.redirect('/?msg=Could+not+load+events&type=error');
    }
};

// ── Public: Get Event Details ────────────────────────────────────────────────
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.redirect('/events?msg=Event+not+found&type=error');

        let isRegistered = false;
        if (req.user) {
            const reg = await Registration.findOne({
                event:  event._id,
                user:   req.user._id,
                status: 'registered'
            });
            if (reg) isRegistered = true;
        }
        res.render('event-details', { event, isRegistered, user: req.user || null });
    } catch (err) {
        console.error('getEventDetails error:', err.message);
        res.redirect('/events?msg=Could+not+load+event&type=error');
    }
};

// ── Register for Event ───────────────────────────────────────────────────────
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event)
            return res.redirect('/events?msg=Event+not+found&type=error');

        if (event.availableSeats <= 0)
            return res.redirect(`/events/${event._id}?msg=Sorry,+no+seats+available&type=error`);

        const alreadyRegistered = await Registration.findOne({
            event: event._id, user: req.user._id, status: 'registered'
        });
        if (alreadyRegistered)
            return res.redirect(`/events/${event._id}?msg=You+are+already+registered&type=warning`);

        // Check deadline
        if (event.registrationDeadline && new Date() > event.registrationDeadline)
            return res.redirect(`/events/${event._id}?msg=Registration+deadline+has+passed&type=error`);

        await Registration.create({ event: event._id, user: req.user._id });
        event.availableSeats -= 1;
        await event.save();
        res.redirect(`/dashboard?msg=Successfully+registered+for+${encodeURIComponent(event.title)}!&type=success`);
    } catch (err) {
        console.error('registerForEvent error:', err.message);
        res.redirect('/events?msg=Registration+failed.+Try+again.&type=error');
    }
};

// ── Cancel Registration ──────────────────────────────────────────────────────
exports.cancelRegistration = async (req, res) => {
    try {
        const reg = await Registration.findOne({
            event: req.params.id, user: req.user._id, status: 'registered'
        });
        if (reg) {
            reg.status = 'cancelled';
            await reg.save();
            const event = await Event.findById(req.params.id);
            if (event) { event.availableSeats += 1; await event.save(); }
            return res.redirect('/dashboard?msg=Registration+cancelled+successfully&type=info');
        }
        res.redirect('/dashboard?msg=No+active+registration+found&type=warning');
    } catch (err) {
        console.error('cancelRegistration error:', err.message);
        res.redirect('/dashboard?msg=Cancellation+failed.+Try+again.&type=error');
    }
};
