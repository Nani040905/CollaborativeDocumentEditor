import mongoose from 'mongoose';

/**
 * MongoDB Mongoose Schema defining the collaborative Document database collection.
 * Supports highly detailed rich-text content types (Quill JSON Deltas),
 * reference associations to the Document Owner user model,
 * and a list of Teammate Collaborators active in workspace.
 * 
 * @module DocumentSchema
 */
const documentSchema = new mongoose.Schema({
    // Display Title of the collaborative notebook/sheet
    // Displayed in dashboard grids and browser tab headers
    title: {
        type: String,
        required: [true, 'Document title cannot be blank.'],
        trim: true,
        default: 'Untitled Document' // Fallback title if none provided
    },
    // Quill editor canvas contents. 
    // Uses Mixed Types to support complex nested delta JSON trees and plain text structures.
    // Mongoose does not strictly type-check Mixed types, allowing Quill total flexibility.
    content: {
        type: mongoose.Schema.Types.Mixed, 
        default: '' // Defaults to empty text for new documents
    },
    // Reference pointer to the Document Owner 
    // Stores the User object ID. Used to enforce strict deletion/sharing permissions.
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' Mongoose model
        required: [true, 'Every document must belong to an owner user.']
    },
    // List of Users invited as editors (Collaborators list)
    // Stores an array of User object IDs. Anyone in this list receives read/write access.
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // References the 'User' Mongoose model for population
    }]
}, {
    // Generates `createdAt` and `updatedAt` timestamp details automatically
    // Critical for sorting dashboard lists by "Recently Modified"
    timestamps: true 
});

// ==========================================
// Performance Database Indexing Strategy
// ==========================================

// Indexing the `owner` field speeds up querying "My Documents" in the dashboard.
documentSchema.index({ owner: 1 });

// Indexing the `collaborators` array speeds up querying "Shared With Me" views.
documentSchema.index({ collaborators: 1 });

// Indexing `updatedAt` in descending order (-1) ensures lightning fast sorting 
// of documents based on recent editing activity.
documentSchema.index({ updatedAt: -1 });

// Compile and export the Document model from the schema
const Document = mongoose.model('Document', documentSchema);
export default Document;
