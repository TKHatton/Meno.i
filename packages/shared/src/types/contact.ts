/**
 * Contact Form type definitions for MenoAI
 */

/**
 * Contact submission status
 */
export type ContactStatus = 'new' | 'replied' | 'resolved';

/**
 * Contact form submission (database record)
 */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

/**
 * DTO for creating contact submission
 */
export interface CreateContactSubmissionDTO {
  name: string;
  email: string;
  message: string;
}

/**
 * DTO for updating contact submission (admin only)
 */
export interface UpdateContactSubmissionDTO {
  status: ContactStatus;
}
