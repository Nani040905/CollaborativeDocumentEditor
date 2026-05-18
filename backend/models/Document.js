import mongoose from 'mongoose';

/**
 * MongoDB Mongoose Schema defining the collaborative Document database collection.
 * Supports highly detailed rich-text content types (Quill JSON Deltas),
 * reference associations to the Document Owner user model,
 * and a list of Teammate Collaborators active in workspace.
 */
const documentSchema = new mongoose.Schema({
    // Display Title of the collaborative notebook/sheet
    title: {
        type: String,
        required: [true, 'Document title cannot be blank.'],
        trim: true,
        default: 'Untitled Document'
    },
    // Quill editor canvas contents. Uses Mixed Types to support delta JSON trees and plain texts.
    content: {
        type: mongoose.Schema.Types.Mixed, // Storing highly detailed Quill JSON Deltas
        default: '' // Defaults to empty text
    },
    // Reference pointer to the Document Owner (User object id)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Every document must belong to an owner user.']
    },
    // List of Users invited as editors (Collaborators list)
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Generates createdAt and updatedAt timestamp details automatically
});

// Performance Database Indexing
// Indexing our user foreign keys speeds up dashboard search and user queries massively.
documentSchema.index({ owner: 1 });
documentSchema.index({ collaborators: 1 });
documentSchema.index({ updatedAt: -1 }); // Index for fast sorting by recently updated documents

const Document = mongoose.model('Document', documentSchema);
export default Document;
