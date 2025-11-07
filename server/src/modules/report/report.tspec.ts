// src/modules/report/report.tspec.ts
import { Tspec } from 'tspec';

// TypeScript interfaces based on your Prisma models and Zod schemas

/** @tspec-description Toilet condition report */
export interface Report {
   /** Unique identifier for the report */
   id: string;
   /** Name of the person submitting the report */
   submitterName: string;
   /** Email of the submitter (optional) */
   submitterEmail?: string;
   /** Phone number of the submitter (optional) */
   submitterPhone?: string;
   /** Nigerian state where toilet is located */
   state: string;
   /** Local Government Area */
   lga: string;
   /** Ward (optional) */
   ward?: string;
   /** Specific address of the toilet facility */
   specificAddress: string;
   /** GPS coordinates (optional) */
   coordinates?: string;
   /** Array of image URLs */
   images: string[];
   /** Additional description (optional) */
   description?: string;
   /** Condition of the toilet */
   toiletCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
   /** Type of facility */
   facilityType:
      | 'PUBLIC'
      | 'PRIVATE'
      | 'SCHOOL'
      | 'HOSPITAL'
      | 'MARKET'
      | 'OFFICE'
      | 'RESIDENTIAL'
      | 'OTHER';
   /** Admin review status */
   status: 'PENDING' | 'APPROVED' | 'REJECTED';
   /** Admin notes (admin only) */
   adminNotes?: string;
   /** When report was reviewed */
   reviewedAt?: string;
   /** ID of admin who reviewed */
   reviewedBy?: string;
   /** Report creation timestamp */
   createdAt: string;
   /** Report update timestamp */
   updatedAt: string;
}

/** @tspec-description Request to create a new report */
export interface CreateReportRequest {
   /** Name of the person submitting the report */
   submitterName: string;
   /** Email of the submitter (optional) */
   submitterEmail?: string;
   /** Phone number of the submitter (optional) */
   submitterPhone?: string;
   /** Nigerian state where toilet is located */
   state: string;
   /** Local Government Area */
   lga: string;
   /** Ward (optional) */
   ward?: string;
   /** Specific address of the toilet facility */
   specificAddress: string;
   /** GPS coordinates (optional) */
   coordinates?: string;
   /** Array of image URLs */
   images: string[];
   /** Additional description (optional) */
   description?: string;
   /** Condition of the toilet */
   toiletCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
   /** Type of facility */
   facilityType:
      | 'PUBLIC'
      | 'PRIVATE'
      | 'SCHOOL'
      | 'HOSPITAL'
      | 'MARKET'
      | 'OFFICE'
      | 'RESIDENTIAL'
      | 'OTHER';
}

/** @tspec-description Request to update report status */
export interface UpdateReportStatusRequest {
   /** Report review status */
   status: 'PENDING' | 'APPROVED' | 'REJECTED';
   /** Admin notes (optional) */
   adminNotes?: string;
   /** ID of admin reviewing */
   reviewedBy?: string;
}

/** @tspec-description Campaign statistics */
export interface ReportStats {
   /** Total number of reports */
   totalReports: number;
   /** Number of approved reports */
   approvedReports: number;
   /** Number of pending reports */
   pendingReports: number;
   /** Number of rejected reports */
   rejectedReports: number;
   /** Reports grouped by state */
   reportsByState: Array<{
      state: string;
      _count: {
         id: number;
      };
   }>;
   /** Reports grouped by condition */
   reportsByCondition: Array<{
      toiletCondition: string;
      _count: {
         id: number;
      };
   }>;
}

/** @tspec-description Paginated reports response */
export interface PaginatedReportsResponse {
   /** Array of report objects */
   reports: Report[];
   /** Total number of reports */
   total: number;
   /** Current page number */
   page: number;
   /** Number of items per page */
   limit: number;
   /** Total number of pages */
   totalPages: number;
}

/** @tspec-description Location-based report for map visualization */
export interface LocationReport {
   /** Report ID */
   id: string;
   /** State name */
   state: string;
   /** LGA name */
   lga: string;
   /** Ward name */
   ward?: string;
   /** Specific address */
   specificAddress: string;
   /** GPS coordinates */
   coordinates?: string;
   /** Toilet condition */
   toiletCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
   /** Facility type */
   facilityType:
      | 'PUBLIC'
      | 'PRIVATE'
      | 'SCHOOL'
      | 'HOSPITAL'
      | 'MARKET'
      | 'OFFICE'
      | 'RESIDENTIAL'
      | 'OTHER';
   /** Image URLs */
   images: string[];
   /** Creation timestamp */
   createdAt: string;
}

/** @tspec-description Recent report for public display */
export interface RecentReport {
   /** Report ID */
   id: string;
   /** Submitter name */
   submitterName: string;
   /** State name */
   state: string;
   /** LGA name */
   lga: string;
   /** Toilet condition */
   toiletCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
   /** Facility type */
   facilityType:
      | 'PUBLIC'
      | 'PRIVATE'
      | 'SCHOOL'
      | 'HOSPITAL'
      | 'MARKET'
      | 'OFFICE'
      | 'RESIDENTIAL'
      | 'OTHER';
   /** Creation timestamp */
   createdAt: string;
}

/** @tspec-description Standard success response */
export interface SuccessResponse<T = any> {
   success: true;
   message: string;
   data?: T;
}

/** @tspec-description Standard error response */
export interface ErrorResponse {
   success: false;
   message: string;
   errors?: any[];
}

// Define your Report API using Tspec
export type ReportApiSpec = Tspec.DefineApiSpec<{
   tags: ['Reports'];
   security: 'bearerAuth';
   paths: {
      /** Submit a new toilet report */
      '/api/v1/report': {
         post: {
            summary: 'Submit a new toilet report';
            description: 'Allows citizens to submit toilet condition reports with photos and location data';
            tags: ['Reports'];
            body: CreateReportRequest;
            responses: {
               /** Report submitted successfully */
               201: SuccessResponse<Report>;
               /** Invalid input data */
               400: ErrorResponse;
            };
         };

         get: {
            summary: 'Get all reports (Admin only)';
            description: 'Retrieve all reports with filtering and pagination for admin dashboard';
            tags: ['Reports'];
            query: {
               /** Page number */
               page?: number;
               /** Number of items per page */
               limit?: number;
               /** Filter by status */
               status?: 'PENDING' | 'APPROVED' | 'REJECTED';
               /** Filter by state */
               state?: string;
               /** Filter by LGA */
               lga?: string;
               /** Filter by facility type */
               facilityType?:
                  | 'PUBLIC'
                  | 'PRIVATE'
                  | 'SCHOOL'
                  | 'HOSPITAL'
                  | 'MARKET'
                  | 'OFFICE'
                  | 'RESIDENTIAL'
                  | 'OTHER';
               /** Filter by toilet condition */
               toiletCondition?:
                  | 'EXCELLENT'
                  | 'GOOD'
                  | 'FAIR'
                  | 'POOR'
                  | 'VERY_POOR';
            };
            responses: {
               /** Reports retrieved successfully */
               200: SuccessResponse<PaginatedReportsResponse>;
               /** Unauthorized */
               401: ErrorResponse;
               /** Admin access required */
               403: ErrorResponse;
            };
         };
      };

      /** Get a specific report */
      '/api/v1/report/:id': {
         get: {
            summary: 'Get a specific report (Admin only)';
            description: 'Retrieve a specific report by ID';
            tags: ['Reports'];
            path: {
               /** Report ID */
               id: string;
            };
            responses: {
               /** Report retrieved successfully */
               200: SuccessResponse<Report>;
               /** Unauthorized */
               401: ErrorResponse;
               /** Report not found */
               404: ErrorResponse;
            };
         };

         delete: {
            summary: 'Delete a report (Admin only)';
            description: 'Delete a specific report';
            tags: ['Reports'];
            path: {
               /** Report ID */
               id: string;
            };
            responses: {
               /** Report deleted successfully */
               200: SuccessResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** Report not found */
               404: ErrorResponse;
            };
         };
      };

      /** Update report status */
      '/api/v1/report/:id/status': {
         patch: {
            summary: 'Update report status (Admin only)';
            description: 'Approve, reject, or change status of a report';
            tags: ['Reports'];
            path: {
               /** Report ID */
               id: string;
            };
            body: UpdateReportStatusRequest;
            responses: {
               /** Report status updated successfully */
               200: SuccessResponse<Report>;
               /** Unauthorized */
               401: ErrorResponse;
               /** Report not found */
               404: ErrorResponse;
            };
         };
      };

      /** Get reports by location */
      '/api/v1/report/location': {
         get: {
            summary: 'Get reports by location (Public)';
            description: 'Get approved reports for map visualization';
            tags: ['Reports'];
            query: {
               /** State name (required) */
               state: string;
               /** LGA name (optional) */
               lga?: string;
            };
            responses: {
               /** Location reports retrieved successfully */
               200: SuccessResponse<LocationReport[]>;
            };
         };
      };

      /** Get campaign statistics */
      '/api/v1/report/stats': {
         get: {
            summary: 'Get campaign statistics (Public)';
            description: 'Get public statistics for the campaign dashboard';
            tags: ['Reports'];
            responses: {
               /** Statistics retrieved successfully */
               200: SuccessResponse<ReportStats>;
            };
         };
      };

      /** Get recent approved reports */
      '/api/v1/report/recent': {
         get: {
            summary: 'Get recent approved reports (Public)';
            description: 'Get recent approved reports for public display';
            tags: ['Reports'];
            query: {
               /** Number of recent reports to return */
               limit?: number;
            };
            responses: {
               /** Recent reports retrieved successfully */
               200: SuccessResponse<RecentReport[]>;
            };
         };
      };
   };
}>;
