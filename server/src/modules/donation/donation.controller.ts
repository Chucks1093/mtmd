import { Request, Response, NextFunction } from 'express';
import {
   createDonationSchema,
   initializePaymentSchema,
   verifyPaymentSchema,
   getDonationSchema,
   filterDonationsSchema,
   updateDonationSchema,
   getDonationStatsSchema,
} from './donation.schema';
import {
   createDonationRepository,
   initializePaystackPayment,
   verifyPaystackPayment,
   getDonationByIdRepository,
   getDonationByReferenceRepository,
   updateDonationRepository,
   getPaginatedDonationsRepository,
   getDonationStatsRepository,
   getPublicDonationStatsRepository,
   cleanupExpiredDonationsRepository,
} from './donation.utils';
import { SendMail, SendMailAsync } from '../../utils/mail.utils';
import { logger } from '../../utils/logger.utils';

/**
 * Create a new donation and initialize Paystack payment
 */

export const createDonation = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = createDonationSchema.parse(req.body);

      console.log('VALIDATED_DATA', validatedData);

      // Create donation record
      const newDonation = await createDonationRepository(validatedData);

      // Initialize Paystack payment
      const paystackData = await initializePaystackPayment(
         newDonation,
         req.body.callbackUrl
      );

      // Send confirmation email to donor
      SendMailAsync({
         to: newDonation.donorEmail,
         subject: 'Thank You for Supporting the National Toilet Campaign!',
         html: `
        <h2>Thank you for your generous donation!</h2>
        <p>Dear ${newDonation.donorName},</p>
        <p>Thank you for your intention to donate <strong>₦${newDonation.amount.toLocaleString()}</strong> to the National Toilet Campaign.</p>
        <p>Your donation ID is: <strong>${newDonation.id}</strong></p>
        <p>Please complete your payment using the payment link provided to finalize your donation.</p>
        <p>Every contribution helps us improve sanitation facilities across Nigeria!</p>
        <p>With gratitude,<br>The National Toilet Campaign Team</p>
      `,
      });

      res.status(201).json({
         success: true,
         message: 'Donation created successfully',
         data: {
            donation: {
               id: newDonation.id,
               amount: newDonation.amount, // Convert back to naira for response
               currency: newDonation.currency,
               type: newDonation.type,
               donorName: newDonation.donorName,
               donorEmail: newDonation.donorEmail,
            },
            payment: {
               authorization_url: paystackData.authorization_url,
               access_code: paystackData.access_code,
               reference: paystackData.reference,
            },
         },
      });
   } catch (error) {
      logger.error('Create donation error:', error);
      next(error);
   }
};

/**
 * Verify Paystack payment and update donation status
 */
export const verifyPayment = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { reference } = verifyPaymentSchema.parse(req.body);

      // Verify payment with Paystack
      const paymentData = await verifyPaystackPayment(reference);

      // Find donation by reference
      const donation = await getDonationByReferenceRepository(reference);
      if (!donation) {
         res.status(404).json({
            success: false,
            message: 'Donation not found for this payment reference',
         });
         return;
      }

      // Determine status based on Paystack response
      let status: 'SUCCESS' | 'FAILED' = 'FAILED';
      if (paymentData.status === 'success') {
         status = 'SUCCESS';
      }

      // Update donation with payment details
      const updatedDonation = await updateDonationRepository({
         id: donation.id,
         status,
         paystackResponse: paymentData,
      });

      // Send appropriate email based on payment status
      if (status === 'SUCCESS') {
         SendMailAsync({
            to: donation.donorEmail,
            subject: 'Donation Successful - Thank You!',
            html: `
          <h2>Your donation was successful!</h2>
          <p>Dear ${donation.donorName},</p>
          <p>Thank you for your generous donation of <strong>₦${donation.amount.toLocaleString()}</strong> to the National Toilet Campaign.</p>
          <p>Payment Details:</p>
          <ul>
            <li><strong>Donation ID:</strong> ${donation.id}</li>
            <li><strong>Transaction Reference:</strong> ${reference}</li>
            <li><strong>Amount:</strong> ₦${donation.amount.toLocaleString()}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Your contribution will make a real difference in improving sanitation facilities across Nigeria. Thank you for being part of this important mission!</p>
          <p>With heartfelt appreciation,<br>The National Toilet Campaign Team</p>
        `,
         });
      } else {
         SendMailAsync({
            to: donation.donorEmail,
            subject: 'Donation Payment Failed',
            html: `
          <h2>Payment was not successful</h2>
          <p>Dear ${donation.donorName},</p>
          <p>Unfortunately, your payment of ₦${donation.amount.toLocaleString()} could not be processed.</p>
          <p>You can try again or contact our support team for assistance.</p>
          <p>Thank you for your support of the National Toilet Campaign.</p>
        `,
         });
      }

      res.status(200).json({
         success: true,
         message:
            status === 'SUCCESS'
               ? 'Payment verified successfully'
               : 'Payment verification failed',
         data: {
            donation: {
               id: updatedDonation.id,
               status: updatedDonation.status,
               amount: donation.amount,
               reference: reference,
            },
            payment: paymentData,
         },
      });
   } catch (error) {
      logger.error('Verify payment error:', error);
      next(error);
   }
};

/**
 * Get a specific donation by ID
 */
export const getDonation = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getDonationSchema.parse(req.params);

      const donation = await getDonationByIdRepository(id);
      if (!donation) {
         res.status(404).json({
            success: false,
            message: 'Donation not found',
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Donation retrieved successfully',
         data: {
            ...donation,
            amount: donation.amount, // Convert back to naira
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get all donations with filtering and pagination (Admin only)
 */
export const getAllDonations = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const filter = filterDonationsSchema.parse({
         page: req.query.page ? parseInt(req.query.page as string) : 1,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         status: req.query.status,
         type: req.query.type,
         minAmount: req.query.minAmount
            ? parseFloat(req.query.minAmount as string)
            : undefined,
         maxAmount: req.query.maxAmount
            ? parseFloat(req.query.maxAmount as string)
            : undefined,
         startDate: req.query.startDate as string,
         endDate: req.query.endDate as string,
         state: req.query.state as string,
         search: req.query.search as string,
      });

      const paginatedData = await getPaginatedDonationsRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Donations retrieved successfully',
         data: paginatedData,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get donation statistics (Admin only)
 */
export const getDonationStats = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const filter = getDonationStatsSchema.parse({
         period: req.query.period as string,
         year: req.query.year ? parseInt(req.query.year as string) : undefined,
      });

      const stats = await getDonationStatsRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Donation statistics retrieved successfully',
         data: stats,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get public donation statistics (for homepage display)
 */
export const getPublicDonationStats = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const stats = await getPublicDonationStatsRepository();

      res.status(200).json({
         success: true,
         message: 'Public donation statistics retrieved successfully',
         data: stats,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Paystack webhook handler for payment notifications
 */
export const paystackWebhook = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const paystackSignature = req.headers['x-paystack-signature'] as string;
      const secret = process.env.PAYSTACK_SECRET_KEY;

      if (!secret) {
         res.status(500).json({
            success: false,
            message: 'Paystack configuration error',
         });
         return;
      }

      // Verify webhook signature
      const crypto = require('crypto');
      const hash = crypto
         .createHmac('sha512', secret)
         .update(JSON.stringify(req.body))
         .digest('hex');

      if (hash !== paystackSignature) {
         logger.warn('Invalid Paystack webhook signature');
         res.status(400).json({
            success: false,
            message: 'Invalid signature',
         });
         return;
      }

      const event = req.body;

      if (event.event === 'charge.success') {
         const { reference } = event.data;

         // Find and update donation
         const donation = await getDonationByReferenceRepository(reference);
         if (donation && donation.status === 'PENDING') {
            await updateDonationRepository({
               id: donation.id,
               status: 'SUCCESS',
               paystackResponse: event.data,
            });

            logger.info(
               `Donation ${donation.id} marked as successful via webhook`
            );
         }
      }

      res.status(200).json({ success: true });
   } catch (error) {
      logger.error('Paystack webhook error:', error);
      next(error);
   }
};

/**
 * Clean up expired pending donations (cron job endpoint)
 */
export const cleanupExpiredDonations = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const result = await cleanupExpiredDonationsRepository();

      logger.info(`Cleaned up ${result.count} expired pending donations`);

      res.status(200).json({
         success: true,
         message: `Cleaned up ${result.count} expired donations`,
         data: { cleanedCount: result.count },
      });
   } catch (error) {
      logger.error('Cleanup expired donations error:', error);
      next(error);
   }
};
