import { model, Schema } from 'mongoose';
import softDeletePlugin from '../../utils/softDeletePlugin.js';


const ticketFileSchema = new Schema({
    file_name: { type: String, required: true }, // Original filename
    file_type: { type: String, required: true }, // MIME type (e.g., 'image/jpeg', 'application/pdf')
    file_route: { type: String, required: true }, // Relative web path (e.g., '/files/uploads/sirket/DEFAULT_SIRKET/tickets/S-000000003/file.jpg')
    file_path: { type: String }, // DEPRECATED: Legacy field, now stores same as file_route for backward compatibility
    file_size: { type: String }, // File size in bytes
    uploader: { type: Schema.Types.ObjectId, ref: 'PartnerUser', required: true },
    ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    muessise_id: { type: Schema.Types.ObjectId, ref: 'Muessise', default: null },
    sirket_id: { type: Schema.Types.ObjectId, ref: 'Sirket', default: null }
}, { timestamps: true });

ticketFileSchema.plugin(softDeletePlugin);

const TicketFile = model("TicketFile", ticketFileSchema);

export default TicketFile;
