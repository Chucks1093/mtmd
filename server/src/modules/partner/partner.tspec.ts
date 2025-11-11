import { Tspec } from 'tspec';

/** @tspec-description Partner organization record */
export interface Partner {
   /** Unique identifier for the partner */
   id: string;
   /** Partner organization name */
   name: string;
   /** Description of the partner organization */
   description: string;
   /** Type of partner organization */
   type:
      | 'CORPORATE'
      | 'NGO'
      | 'GOVERNMENT'
      | 'INTERNATIONAL'
      | 'COMMUNITY'
      | 'ACADEMIC'
      | 'MEDIA';
   /** Partner logo URL */
   logo?: string;
   /** Partner website URL */
   website?: string;
   /** Partner contact email */
   email?: string;
   /** Partner contact phone */
   phone?: string;
   /** Contact person name */
   contactPerson?: string;
   /** Contact person role/title */
   contactPersonRole?: string;
   /** State where partner is located */
   state?: string;
   /** LGA where partner is located */
   lga?: string;
   /** Physical address */
   address?: string;
   /** Social media profiles */
   socialMedia?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
   };
   /** Partnership details */
   partnershipDetails?: {
      startDate?: string;
      endDate?: string;
      partnershipType?: string;
      contributions?: string[];
      benefits?: string[];
   };
   /** Whether partner is featured */
   featured: boolean;
   /** Display order for sorting */
   displayOrder: number;
   /** Partner status */
   status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
   /** Admin who created the partner */
   createdBy?: {
      id: string;
      name: string;
      email: string;
   };
   /** Admin who last updated the partner */
   updatedBy?: {
      id: string;
      name: string;
      email: string;
   };
   /** Partner creation timestamp */
   createdAt: string;
   /** Partner update timestamp */
   updatedAt: string;
}

/** @tspec-description Request to create a new partner */
export interface CreatePartnerRequest {
   /** Partner organization name */
   name: string;
   /** Description of the partner organization */
   description: string;
   /** Type of partner organization */
   type:
      | 'CORPORATE'
      | 'NGO'
      | 'GOVERNMENT'
      | 'INTERNATIONAL'
      | 'COMMUNITY'
      | 'ACADEMIC'
      | 'MEDIA';
   /** Partner logo URL (optional) */
   logo?: string;
   /** Partner website URL (optional) */
   website?: string;
   /** Partner contact email (optional) */
   email?: string;
   /** Partner contact phone (optional) */
   phone?: string;
   /** Contact person name (optional) */
   contactPerson?: string;
   /** Contact person role/title (optional) */
   contactPersonRole?: string;
   /** State where partner is located (optional) */
   state?: string;
   /** LGA where partner is located (optional) */
   lga?: string;
   /** Physical address (optional) */
   address?: string;
   /** Social media profiles (optional) */
   socialMedia?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
   };
   /** Partnership details (optional) */
   partnershipDetails?: {
      startDate?: string;
      endDate?: string;
      partnershipType?: string;
      contributions?: string[];
      benefits?: string[];
   };
   /** Whether partner should be featured (default: false) */
   featured?: boolean;
   /** Display order for sorting (default: 0) */
   displayOrder?: number;
   /** Partner status (default: PENDING) */
   status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

/** @tspec-description Request to update partner information */
export interface UpdatePartnerRequest {
   /** Partner organization name (optional) */
   name?: string;
   /** Description of the partner organization (optional) */
   description?: string;
   /** Type of partner organization (optional) */
   type?:
      | 'CORPORATE'
      | 'NGO'
      | 'GOVERNMENT'
      | 'INTERNATIONAL'
      | 'COMMUNITY'
      | 'ACADEMIC'
      | 'MEDIA';
   /** Partner logo URL (optional) */
   logo?: string;
   /** Partner website URL (optional) */
   website?: string;
   /** Partner contact email (optional) */
   email?: string;
   /** Partner contact phone (optional) */
   phone?: string;
   /** Contact person name (optional) */
   contactPerson?: string;
   /** Contact person role/title (optional) */
   contactPersonRole?: string;
   /** State where partner is located (optional) */
   state?: string;
   /** LGA where partner is located (optional) */
   lga?: string;
   /** Physical address (optional) */
   address?: string;
   /** Social media profiles (optional) */
   socialMedia?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
   };
   /** Partnership details (optional) */
   partnershipDetails?: {
      startDate?: string;
      endDate?: string;
      partnershipType?: string;
      contributions?: string[];
      benefits?: string[];
   };
   /** Whether partner should be featured (optional) */
   featured?: boolean;
   /** Display order for sorting (optional) */
   displayOrder?: number;
   /** Partner status (optional) */
   status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

/** @tspec-description Partner statistics */
export interface PartnerStats {
   /** Total number of partners */
   totalPartners: number;
   /** Number of active partners */
   activePartners: number;
   /** Number of featured partners */
   featuredPartners: number;
   /** Number of pending partners */
   pendingPartners: number;
   /** Partners grouped by type */
   partnersByType: Array<{
      type: string;
      count: number;
   }>;
   /** Partners grouped by state (top 10) */
   partnersByState: Array<{
      state: string;
      count: number;
   }>;
   /** Recent partners */
   recentPartners: Array<{
      id: string;
      name: string;
      type: string;
      logo?: string;
      createdAt: string;
   }>;
}

/** @tspec-description Paginated partners response */
export interface PaginatedPartnersResponse {
   /** Array of partner objects */
   partners: Partner[];
   /** Total number of partners */
   total: number;
   /** Current page number */
   page: number;
   /** Number of items per page */
   limit: number;
   /** Total number of pages */
   totalPages: number;
}

/** @tspec-description Bulk status update request */
export interface BulkUpdateStatusRequest {
   /** Array of partner IDs to update */
   partnerIds: string[];
   /** New status for all selected partners */
   status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

/** @tspec-description Display order update request */
export interface DisplayOrderUpdateRequest {
   /** New display order value */
   displayOrder: number;
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

export type PartnerApiSpec = Tspec.DefineApiSpec<{
   tags: ['Partners'];
   security: 'bearerAuth';
   paths: {
      /** Create a new partner */
      '/api/v1/partner': {
         post: {
            summary: 'Create a new partner (Admin only)';
            description: 'Add a new partner organization to the campaign';
            tags: ['Partners'];
            body: CreatePartnerRequest;
            responses: {
               /** Partner created successfully */
               201: SuccessResponse<Partner>;
               /** Invalid input data or partner name already exists */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
         get: {
            summary: 'Get all partners (Admin only)';
            description: 'Retrieve all partners with filtering and pagination (admin view with full details)';
            tags: ['Partners'];
            query: {
               /** Page number */
               page?: number;
               /** Number of items per page */
               limit?: number;
               /** Filter by partner type */
               type?:
                  | 'CORPORATE'
                  | 'NGO'
                  | 'GOVERNMENT'
                  | 'INTERNATIONAL'
                  | 'COMMUNITY'
                  | 'ACADEMIC'
                  | 'MEDIA';
               /** Filter by status */
               status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
               /** Filter by featured status */
               featured?: boolean;
               /** Filter by state */
               state?: string;
               /** Search by name, description, or contact person */
               search?: string;
            };
            responses: {
               /** Partners retrieved successfully */
               200: SuccessResponse<PaginatedPartnersResponse>;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };

      /** Get public partners */
      '/api/v1/partner/public': {
         get: {
            summary: 'Get public partners';
            description: 'Get active partners for public display (limited information)';
            tags: ['Partners'];
            query: {
               /** Page number */
               page?: number;
               /** Number of items per page */
               limit?: number;
               /** Filter by partner type */
               type?:
                  | 'CORPORATE'
                  | 'NGO'
                  | 'GOVERNMENT'
                  | 'INTERNATIONAL'
                  | 'COMMUNITY'
                  | 'ACADEMIC'
                  | 'MEDIA';
               /** Filter by featured status */
               featured?: boolean;
               /** Filter by state */
               state?: string;
            };
            responses: {
               /** Public partners retrieved successfully */
               200: SuccessResponse<PaginatedPartnersResponse>;
            };
         };
      };

      /** Get featured partners */
      '/api/v1/partner/featured': {
         get: {
            summary: 'Get featured partners';
            description: 'Get featured partners for homepage display';
            tags: ['Partners'];
            query: {
               /** Maximum number of featured partners to return */
               limit?: number;
            };
            responses: {
               /** Featured partners retrieved successfully */
               200: SuccessResponse<Partner[]>;
            };
         };
      };

      /** Get partners by type */
      '/api/v1/partner/type/:type': {
         get: {
            summary: 'Get partners by type';
            description: 'Get active partners filtered by organization type';
            tags: ['Partners'];
            path: {
               /** Partner organization type */
               type:
                  | 'CORPORATE'
                  | 'NGO'
                  | 'GOVERNMENT'
                  | 'INTERNATIONAL'
                  | 'COMMUNITY'
                  | 'ACADEMIC'
                  | 'MEDIA';
            };
            query: {
               /** Maximum number of partners to return */
               limit?: number;
            };
            responses: {
               /** Partners by type retrieved successfully */
               200: SuccessResponse<Partner[]>;
            };
         };
      };

      /** Get specific partner */
      '/api/v1/partner/:id': {
         get: {
            summary: 'Get specific partner';
            description: 'Retrieve a specific partner by ID (public can only see active partners)';
            tags: ['Partners'];
            path: {
               /** Partner ID */
               id: string;
            };
            responses: {
               /** Partner retrieved successfully */
               200: SuccessResponse<Partner>;
               /** Partner not found */
               404: ErrorResponse;
            };
         };
         patch: {
            summary: 'Update partner (Admin only)';
            description: 'Update partner information';
            tags: ['Partners'];
            path: {
               /** Partner ID */
               id: string;
            };
            body: UpdatePartnerRequest;
            responses: {
               /** Partner updated successfully */
               200: SuccessResponse<Partner>;
               /** Invalid input data or partner name already exists */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** Partner not found */
               404: ErrorResponse;
            };
         };
         delete: {
            summary: 'Delete partner (Admin only)';
            description: 'Delete a partner from the system';
            tags: ['Partners'];
            path: {
               /** Partner ID */
               id: string;
            };
            responses: {
               /** Partner deleted successfully */
               200: SuccessResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** Partner not found */
               404: ErrorResponse;
            };
         };
      };

      /** Get partner statistics */
      '/api/v1/partner/stats/analytics': {
         get: {
            summary: 'Get partner statistics (Admin only)';
            description: 'Get comprehensive partner analytics and statistics';
            tags: ['Partners'];
            responses: {
               /** Partner statistics retrieved successfully */
               200: SuccessResponse<PartnerStats>;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };

      /** Update partner display order */
      '/api/v1/partner/:id/display-order': {
         patch: {
            summary: 'Update partner display order (Admin only)';
            description: 'Update the display order of a partner for sorting purposes';
            tags: ['Partners'];
            path: {
               /** Partner ID */
               id: string;
            };
            body: DisplayOrderUpdateRequest;
            responses: {
               /** Display order updated successfully */
               200: SuccessResponse<Partner>;
               /** Invalid display order value */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** Partner not found */
               404: ErrorResponse;
            };
         };
      };

      /** Bulk update partner status */
      '/api/v1/partner/bulk/status': {
         patch: {
            summary: 'Bulk update partner status (Admin only)';
            description: 'Update status for multiple partners at once';
            tags: ['Partners'];
            body: BulkUpdateStatusRequest;
            responses: {
               /** Partners updated successfully */
               200: SuccessResponse<{ updatedCount: number }>;
               /** Invalid input data */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };
   };
}>;
