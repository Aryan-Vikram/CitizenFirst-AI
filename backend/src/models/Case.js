const mongoose = require('mongoose');

/**
 * Case is the unified record CitizenFirst AI creates per citizen issue,
 * regardless of how many departments or duplicate reports feed into it.
 * This schema is the target shape for a live MongoDB deployment; the
 * in-memory store in src/data/store.js mirrors this exact shape so
 * swapping the data layer later does not require touching controllers.
 */
const timelineEntrySchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    at: { type: Date, required: true },
    note: String,
    actor: String
  },
  { _id: false }
);

const priorityFactorSchema = new mongoose.Schema(
  {
    points: Number,
    max: Number,
    reason: String
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    issueType: { type: String, required: true },
    issueLabel: { type: String, required: true },

    city: { type: String, required: true },
    ward: String,
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    locationTags: [String],

    departments: [{ type: String }],
    primaryDepartment: { type: String, required: true },

    status: {
      type: String,
      enum: [
        'Submitted',
        'AI Verified',
        'Routed',
        'Department Accepted',
        'Field Inspection',
        'Work in Progress',
        'Resolution Submitted',
        'AI Verification',
        'Resolved',
        'Reopened'
      ],
      default: 'Submitted'
    },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },

    priorityScore: { type: Number, default: 0 },
    priorityBand: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
    priorityFactors: {
      severity: priorityFactorSchema,
      citizensAffected: priorityFactorSchema,
      locationRisk: priorityFactorSchema,
      duration: priorityFactorSchema,
      reportFrequency: priorityFactorSchema
    },

    citizenReports: { type: Number, default: 1 },
    affectedPopulationEstimate: { type: Number, default: 0 },
    isDuplicateCluster: { type: Boolean, default: false },
    linkedReportIds: [String],
    masterCaseId: String,

    slaHours: { type: Number, default: 72 },
    firstReportedAt: { type: Date, required: true },
    lastUpdatedAt: { type: Date, default: Date.now },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    timeline: [timelineEntrySchema],
    evidence: [
      {
        type: { type: String, enum: ['photo', 'video', 'note'] },
        url: String,
        stage: { type: String, enum: ['before', 'after', 'general'] },
        uploadedAt: Date
      }
    ],

    aiAnalysis: {
      detectedIssue: String,
      confidence: Number,
      suggestedDepartment: String,
      relatedCases: Number,
      isMockAnalysis: { type: Boolean, default: true }
    },

    citizenFeedback: {
      resolved: { type: String, enum: ['yes', 'no', 'partially'] },
      rating: Number,
      comment: String,
      submittedAt: Date
    },

    demoData: { type: Boolean, default: true }
  },
  { timestamps: true }
);

caseSchema.index({ 'location.lat': 1, 'location.lng': 1 });
caseSchema.index({ status: 1, priorityScore: -1 });

module.exports = mongoose.models.Case || mongoose.model('Case', caseSchema);
