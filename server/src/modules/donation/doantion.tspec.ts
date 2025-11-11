import { Tspec } from 'tspec';

/** @tspec-description Donation record */
export interface Donation {
   /** Unique identifier for the donation */
   id: string;
   /** Name of the donor */
   donorName: string;
   /** Email address of the donor */
   donorEmail: string;
   /** Phone number of the donor (optional) */
   donorPhone?: string;
   /** Donation amount in Naira */
   amount: number;
   /** Currency code (default: NGN) */
   currency: string;
   /** Type of donation */
   type: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
   /** Optional message from donor */
   message?: string;
   /** Whether donation is anonymous */
   isAnonymous: boolean;
   /** State where donor is from (optional) */
   state?: string;
   /** LGA where donor is from (optional) */
   lga?: string;
   /** Payment status */
   status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
   /** Paystack payment reference */
   paystackReference?: string;
   /** Paystack response data */
   paystackResponse?: any;
   /** Donation creation timestamp */
   createdAt: string;
   /** Donation update timestamp */
   updatedAt: string;
}

/** @tspec-description Request to create a new donation */
export interface CreateDonationRequest {
   /** Name of the donor */
   donorName: string;
   /** Email address of the donor */
   donorEmail: string;
   /** Phone number of the donor (optional) */
   donorPhone?: string;
   /** Donation amount in Naira (minimum ₦100) */
   amount: number;
   /** Currency code (default: NGN) */
   currency?: string;
   /** Type of donation (default: ONE_TIME) */
   type?: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
   /** Optional message from donor */
   message?: string;
   /** Whether donation should be anonymous */
   isAnonymous?: boolean;
   /** State where donor is from (optional) */
   state?: string;
   /** LGA where donor is from (optional) */
   lga?: string;
   /** Callback URL after payment (optional) */
   callbackUrl?: string;
}

/** @tspec-description Paystack payment initialization response */
export interface PaymentInitializationResponse {
   /** Paystack authorization URL for payment */
   authorization_url: string;
   /** Access code for the payment session */
   access_code: string;
   /** Payment reference ID */
   reference: string;
}

/** @tspec-description Payment verification request */
export interface VerifyPaymentRequest {
   /** Paystack payment reference to verify */
   reference: string;
}

/** @tspec-description Donation statistics */
export interface DonationStats {
   /** Total number of successful donations */
   totalDonations: number;
   /** Total amount raised in Naira */
   totalAmountRaised: number;
   /** Payment success rate percentage */
   successRate: number;
   /** Donations grouped by status */
   donationsByStatus: Array<{
      status: string;
      count: number;
      totalAmount: number;
   }>;
   /** Donations grouped by type */
   donationsByType: Array<{
      type: string;
      count: number;
      totalAmount: number;
   }>;
   /** Recent successful donations */
   recentDonations: Array<{
      id: string;
      donorName: string;
      amount: number;
      type: string;
      createdAt: string;
   }>;
   /** Top donors (non-anonymous) */
   topDonors: Array<{
      donorName: string;
      donorEmail: string;
      donationCount: number;
      totalAmount: number;
   }>;
}

/** @tspec-description Public donation statistics for homepage */
export interface PublicDonationStats {
   /** Total amount raised in Naira */
   totalAmountRaised: number;
   /** Total number of unique donors */
   totalDonors: number;
   /** Total number of successful donations */
   totalDonations: number;
}

/** @tspec-description Paginated donations response */
export interface PaginatedDonationsResponse {
   /** Array of donation objects */
   donations: Donation[];
   /** Total number of donations */
   total: number;
   /** Current page number */
   page: number;
   /** Number of items per page */
   limit: number;
   /** Total number of pages */
   totalPages: number;
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

export type DonationApiSpec = Tspec.DefineApiSpec<{
   tags: ['Donations'];
   security: 'bearerAuth';
   paths: {
      /** Create a new donation */
      '/api/v1/donation': {
         post: {
            summary: 'Create a new donation';
            description: 'Create a donation and initialize Paystack payment';
            tags: ['Donations'];
            body: CreateDonationRequest;
            responses: {
               /** Donation created successfully */
               201: SuccessResponse<{
                  donation: {
                     id: string;
                     amount: number;
                     currency: string;
                     type: string;
                     donorName: string;
                     donorEmail: string;
                  };
                  payment: PaymentInitializationResponse;
               }>;
               /** Invalid input data */
               400: ErrorResponse;
            };
         };
         get: {
            summary: 'Get all donations (Admin only)';
            description: 'Retrieve all donations with filtering and pagination';
            tags: ['Donations'];
            query: {
               /** Page number */
               page?: number;
               /** Number of items per page */
               limit?: number;
               /** Filter by status */
               status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
               /** Filter by type */
               type?: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
               /** Minimum amount filter */
               minAmount?: number;
               /** Maximum amount filter */
               maxAmount?: number;
               /** Start date filter (ISO string) */
               startDate?: string;
               /** End date filter (ISO string) */
               endDate?: string;
               /** Filter by state */
               state?: string;
               /** Search by donor name or email */
               search?: string;
            };
            responses: {
               /** Donations retrieved successfully */
               200: SuccessResponse<PaginatedDonationsResponse>;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };

      /** Verify Paystack payment */
      '/api/v1/donation/verify': {
         post: {
            summary: 'Verify Paystack payment';
            description: 'Verify payment status and update donation record';
            tags: ['Donations'];
            body: VerifyPaymentRequest;
            responses: {
               /** Payment verified successfully */
               200: SuccessResponse<{
                  donation: {
                     id: string;
                     status: string;
                     amount: number;
                     reference: string;
                  };
                  payment: any;
               }>;
               /** Payment verification failed */
               400: ErrorResponse;
               /** Donation not found */
               404: ErrorResponse;
            };
         };
      };

      /** Get donation statistics */
      '/api/v1/donation/stats': {
         get: {
            summary: 'Get donation statistics (Admin only)';
            description: 'Get comprehensive donation analytics and statistics';
            tags: ['Donations'];
            query: {
               /** Statistics period */
               period?: 'week' | 'month' | 'quarter' | 'year';
               /** Year filter */
               year?: number;
            };
            responses: {
               /** Statistics retrieved successfully */
               200: SuccessResponse<DonationStats>;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };

      /** Get public donation statistics */
      '/api/v1/donation/stats/public': {
         get: {
            summary: 'Get public donation statistics';
            description: 'Get basic donation statistics for public display on homepage';
            tags: ['Donations'];
            responses: {
               /** Public statistics retrieved successfully */
               200: SuccessResponse<PublicDonationStats>;
            };
         };
      };

      /** Get specific donation */
      '/api/v1/donation/:id': {
         get: {
            summary: 'Get specific donation (Admin only)';
            description: 'Retrieve a specific donation by ID';
            tags: ['Donations'];
            path: {
               /** Donation ID */
               id: string;
            };
            responses: {
               /** Donation retrieved successfully */
               200: SuccessResponse<Donation>;
               /** Unauthorized */
               401: ErrorResponse;
               /** Donation not found */
               404: ErrorResponse;
            };
         };
      };

      /** Paystack webhook */
      '/api/v1/donation/webhook/paystack': {
         post: {
            summary: 'Paystack webhook endpoint';
            description: 'Handle Paystack payment notifications';
            tags: ['Donations'];
            body: any;
            responses: {
               /** Webhook processed successfully */
               200: SuccessResponse;
               /** Invalid signature */
               400: ErrorResponse;
            };
         };
      };

      /** Cleanup expired donations */
      '/api/v1/donation/cleanup': {
         post: {
            summary: 'Cleanup expired donations (Admin only)';
            description: 'Mark expired pending donations as cancelled';
            tags: ['Donations'];
            responses: {
               /** Cleanup completed successfully */
               200: SuccessResponse<{ cleanedCount: number }>;
               /** Unauthorized */
               401: ErrorResponse;
            };
         };
      };
   };
}>;
