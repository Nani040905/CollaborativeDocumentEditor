import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Document title cannot be blank.'],
        trim: true,
        default: 'Untitled Document'
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Storing highly detailed Quill JSON Deltas
        default: '' // Defaults to empty text
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Every document must belong to an owner user.']
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Performance Database Indexing
// Indexing our user foreign keys speeds up dashboard search speeds massively
documentSchema.index({ owner: 1 });
documentSchema.index({ collaborators: 1 });
documentSchema.index({ updatedAt: -1 }); // Index for sorting by recently updated

const Document = mongoose.model('Document', documentSchema);
export default Document;
