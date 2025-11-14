import { prisma } from '../../utils/prisma.utils';
import {
   CreateDonation,
   FilterDonations,
   UpdateDonation,
   GetDonationStats,
} from './donation.schema';
import crypto from 'crypto';

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackResponse {
   status: boolean;
   message: string;
   data?: any;
}

export interface PaystackInitializeData {
   authorization_url: string;
   access_code: string;
   reference: string;
}

export interface PaystackVerificationData {
   amount: number;
   currency: string;
   transaction_date: string;
   status: string;
   reference: string;
   domain: string;
   metadata: any;
   gateway_response: string;
   message: string;
   channel: string;
   ip_address: string;
   fees: number;
   customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
   };
}

/**
 * Create a new donation record
 */
export async function createDonationRepository(data: CreateDonation) {
   const donationId = crypto.randomBytes(16).toString('hex');

   return await prisma.donation.create({
      data: {
         id: donationId,
         donorName: data.donorName,
         donorEmail: data.donorEmail,
         donorPhone: data.donorPhone,
         amount: data.amount,
         currency: data.currency,
         type: data.type,
         message: data.message,
         isAnonymous: data.isAnonymous,
         state: data.state,
         lga: data.lga,
         status: 'PENDING',
      },
   });
}

/**
 * Initialize Paystack payment
 */
export async function initializePaystackPayment(
   donation: any,
   callbackUrl?: string
): Promise<PaystackInitializeData> {
   const paystackUrl = `${PAYSTACK_BASE_URL}/transaction/initialize`;
   const frontendUrl = process.env.FRONTEND_URL;

   const paymentData = {
      email: donation.donorEmail,
      amount: donation.amount * 100, // Convert to kobo
      currency: donation.currency,
      reference: `NTC_${donation.id}_${Date.now()}`,
      callback_url: callbackUrl || `${frontendUrl}/donations/verify`,
      metadata: {
         donation_id: donation.id,
         donor_name: donation.donorName,
         donor_phone: donation.donorPhone,
         type: donation.type,
         custom_fields: [
            {
               display_name: 'Donation Type',
               variable_name: 'donation_type',
               value: donation.type,
            },
            {
               display_name: 'Campaign',
               variable_name: 'campaign',
               value: 'National Toilet Campaign',
            },
         ],
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
   };

   console.log('PAYMENT_DATA', paymentData);

   const response = await fetch(paystackUrl, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
   });

   if (!response.ok) {
      throw new Error(`Paystack initialization failed: ${response.statusText}`);
   }

   const result: PaystackResponse = await response.json();

   if (!result.status) {
      throw new Error(result.message || 'Failed to initialize payment');
   }

   // Update donation with Paystack reference
   await prisma.donation.update({
      where: { id: donation.id },
      data: {
         paystackReference: result.data.reference,
      },
   });

   return result.data;
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackPayment(
   reference: string
): Promise<PaystackVerificationData> {
   const paystackUrl = `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`;

   const response = await fetch(paystackUrl, {
      method: 'GET',
      headers: {
         Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
         'Content-Type': 'application/json',
      },
   });

   if (!response.ok) {
      throw new Error(`Paystack verification failed: ${response.statusText}`);
   }

   const result: PaystackResponse = await response.json();

   if (!result.status) {
      throw new Error(result.message || 'Failed to verify payment');
   }

   return result.data;
}

/**
 * Get donation by ID
 */
export async function getDonationByIdRepository(id: string) {
   return await prisma.donation.findUnique({
      where: { id },
   });
}

/**
 * Get donation by Paystack reference
 */
export async function getDonationByReferenceRepository(reference: string) {
   return await prisma.donation.findFirst({
      where: { paystackReference: reference },
   });
}

/**
 * Update donation status and payment details
 */
export async function updateDonationRepository(data: UpdateDonation) {
   const { id, ...updateData } = data;

   return await prisma.donation.update({
      where: { id },
      data: {
         ...updateData,
         updatedAt: new Date(),
      },
   });
}

/**
 * Get paginated donations with filtering
 */
export async function getPaginatedDonationsRepository(
   filters: FilterDonations
) {
   const {
      page,
      limit,
      status,
      type,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      state,
      search,
   } = filters;

   const whereClause: any = {};

   if (status) whereClause.status = status;
   if (type) whereClause.type = type;
   if (state) whereClause.state = state;

   if (minAmount || maxAmount) {
      whereClause.amount = {};
      if (minAmount) whereClause.amount.gte = minAmount * 100; // Convert to kobo
      if (maxAmount) whereClause.amount.lte = maxAmount * 100; // Convert to kobo
   }

   if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
   }

   if (search) {
      whereClause.OR = [
         { donorName: { contains: search, mode: 'insensitive' } },
         { donorEmail: { contains: search, mode: 'insensitive' } },
      ];
   }

   const total = await prisma.donation.count({ where: whereClause });
   const skip = (page - 1) * limit;
   const totalPages = Math.ceil(total / limit);

   const donations = await prisma.donation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         donorName: true,
         donorEmail: true,
         amount: true,
         currency: true,
         type: true,
         status: true,
         isAnonymous: true,
         state: true,
         lga: true,
         message: true,
         paystackReference: true,
         createdAt: true,
      },
   });

   // Convert amounts back from kobo to naira for display
   const formattedDonations = donations.map(donation => ({
      ...donation,
      amount: donation.amount,
   }));

   return {
      donations: formattedDonations,
      total,
      page,
      limit,
      totalPages,
   };
}

/**
 * Get donation statistics
 */
export async function getDonationStatsRepository(filters: GetDonationStats) {
   const { period, year } = filters;
   const currentYear = year || new Date().getFullYear();

   // Total donations
   const totalDonations = await prisma.donation.count({
      where: { status: 'SUCCESS' },
   });

   // Total amount raised (convert from kobo to naira)
   const totalAmountResult = await prisma.donation.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
   });
   const totalAmountRaised = totalAmountResult._sum.amount || 0;

   // Success rate
   const allDonations = await prisma.donation.count();
   const successfulDonations = await prisma.donation.count({
      where: { status: 'SUCCESS' },
   });
   const successRate =
      allDonations > 0 ? (successfulDonations / allDonations) * 100 : 0;

   // Donations by status
   const donationsByStatus = await prisma.donation.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
   });

   // Format donations by status
   const formattedByStatus = donationsByStatus.map(item => ({
      status: item.status,
      count: item._count.id,
      totalAmount: item._sum.amount || 0,
   }));

   // Donations by type
   const donationsByType = await prisma.donation.groupBy({
      by: ['type'],
      where: { status: 'SUCCESS' },
      _count: { id: true },
      _sum: { amount: true },
   });

   const formattedByType = donationsByType.map(item => ({
      type: item.type,
      count: item._count.id,
      totalAmount: item._sum.amount || 0,
   }));

   // Recent donations
   const recentDonations = await prisma.donation.findMany({
      where: { status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
         id: true,
         donorName: true,
         amount: true,
         type: true,
         isAnonymous: true,
         createdAt: true,
      },
   });

   const formattedRecentDonations = recentDonations.map(donation => ({
      ...donation,
      amount: donation.amount / 100,
      donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
   }));

   // Top donors (only if not anonymous)
   const topDonors = await prisma.donation.groupBy({
      by: ['donorEmail', 'donorName'],
      where: {
         status: 'SUCCESS',
         isAnonymous: false,
      },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
   });

   const formattedTopDonors = topDonors.map(donor => ({
      donorName: donor.donorName,
      donorEmail: donor.donorEmail,
      donationCount: donor._count.id,
      totalAmount: (donor._sum.amount || 0) / 100,
   }));

   return {
      totalDonations,
      totalAmountRaised,
      successRate: Math.round(successRate * 100) / 100,
      donationsByStatus: formattedByStatus,
      donationsByType: formattedByType,
      recentDonations: formattedRecentDonations,
      topDonors: formattedTopDonors,
   };
}

/**
 * Get public donation statistics (for homepage/public display)
 */
export async function getPublicDonationStatsRepository() {
   const totalAmountResult = await prisma.donation.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
   });

   const totalAmountRaised = totalAmountResult._sum.amount || 0;

   // Get unique donor count by grouping by donorEmail
   const uniqueDonors = await prisma.donation.groupBy({
      by: ['donorEmail'],
      where: { status: 'SUCCESS' },
      _count: { donorEmail: true },
   });

   const totalDonors = uniqueDonors.length;

   const totalDonations = await prisma.donation.count({
      where: { status: 'SUCCESS' },
   });

   return {
      totalAmountRaised,
      totalDonors,
      totalDonations,
   };
}

/**
 * Clean up expired pending donations (older than 1 hour)
 */
export async function cleanupExpiredDonationsRepository() {
   const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

   return await prisma.donation.updateMany({
      where: {
         status: 'PENDING',
         createdAt: {
            lt: oneHourAgo,
         },
      },
      data: {
         status: 'CANCELLED',
      },
   });
}
