import mongoose from 'mongoose';
import AdminUser from '../../models/adminUsersModel.js';

const { Schema } = mongoose;

const ticketMessageSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        refPath: 'fromModel'
    },
    fromModel: {
        type: String,
        required: true,
        enum: ['Muessise', 'Sirket', 'AdminUser', 'PeopleUser', 'PartnerUser'] // izin verilen modeller
    },
    to: {
        type: Schema.Types.ObjectId,
        refPath: 'toModel'
    },
    toModel: {
        type: String,
        required: true,
        enum: ['Muessise', 'Sirket', 'AdminUser'] // izin verilen modeller
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['read', 'unread', 'sended', 'canceled'],
        default: 'sended',
        required: true
    },
    ticket_id: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    }
}, {
    timestamps: true 
});

// Virtual relationship with TicketFile
ticketMessageSchema.virtual('files', {
    ref: 'TicketFile',
    localField: 'ticket_id',
    foreignField: 'ticket_id',
    justOne: false
});

// Enable virtuals in JSON
ticketMessageSchema.set('toJSON', { virtuals: true });
ticketMessageSchema.set('toObject', { virtuals: true });

const TicketMessage = mongoose.models.TicketMessage || mongoose.model('TicketMessage', ticketMessageSchema);

export default TicketMessage; 