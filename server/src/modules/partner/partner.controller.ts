import { Request, Response, NextFunction } from 'express';
import {
   createPartnerSchema,
   updatePartnerSchema,
   getPartnerSchema,
   filterPartnersSchema,
   getPublicPartnersSchema,
   PartnerType,
} from './partner.schema';
import {
   createPartnerRepository,
   getPartnerByIdRepository,
   updatePartnerRepository,
   deletePartnerRepository,
   getPaginatedPartnersRepository,
   getPublicPartnersRepository,
   getFeaturedPartnersRepository,
   getPartnerStatsRepository,
   checkPartnerNameExistsRepository,
   updatePartnerDisplayOrderRepository,
   bulkUpdatePartnerStatusRepository,
   getPartnersByTypeRepository,
} from './partner.utils';
import { SendMailAsync } from '../../utils/mail.utils';
import { logger } from '../../utils/logger.utils';

/**
 * Create a new partner (Admin only)
 */
export const createPartner = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = createPartnerSchema.parse(req.body);
      const createdById = req.admin!.id;

      // Check if partner name already exists
      const nameExists = await checkPartnerNameExistsRepository(
         validatedData.name
      );
      if (nameExists) {
         res.status(400).json({
            success: false,
            message: 'A partner with this name already exists',
         });
         return;
      }

      const newPartner = await createPartnerRepository(
         validatedData,
         createdById
      );

      // Send notification email if partner has email
      if (newPartner.email) {
         SendMailAsync({
            to: newPartner.email,
            subject: 'Welcome to the National Toilet Campaign Partnership!',
            html: `
          <h2>Welcome to our Partnership Program!</h2>
          <p>Dear ${newPartner.contactPerson || 'Partner'},</p>
          <p>We are excited to announce that <strong>${newPartner.name}</strong> has been added as a partner of the National Toilet Campaign.</p>
          <p>Partnership Details:</p>
          <ul>
            <li><strong>Partner ID:</strong> ${newPartner.id}</li>
            <li><strong>Partner Type:</strong> ${newPartner.type}</li>
            <li><strong>Status:</strong> ${newPartner.status}</li>
          </ul>
          <p>We look forward to working together to improve sanitation facilities across Nigeria!</p>
          <p>Best regards,<br>The National Toilet Campaign Team</p>
        `,
         });
      }

      res.status(201).json({
         success: true,
         message: 'Partner created successfully',
         data: newPartner,
      });
   } catch (error) {
      logger.error('Create partner error:', error);
      next(error);
   }
};

/**
 * Get all partners (Admin view with full details)
 */
export const getAllPartners = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const filter = filterPartnersSchema.parse({
         page: req.query.page ? parseInt(req.query.page as string) : 1,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         type: req.query.type as string,
         status: req.query.status as string,
         featured:
            req.query.featured === 'true'
               ? true
               : req.query.featured === 'false'
                 ? false
                 : undefined,
         state: req.query.state as string,
         search: req.query.search as string,
      });

      const paginatedData = await getPaginatedPartnersRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Partners retrieved successfully',
         data: paginatedData,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get public partners (Public view - only active partners)
 */
export const getPublicPartners = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const filter = getPublicPartnersSchema.parse({
         page: req.query.page ? parseInt(req.query.page as string) : 1,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
         type: req.query.type as string,
         featured:
            req.query.featured === 'true'
               ? true
               : req.query.featured === 'false'
                 ? false
                 : undefined,
         state: req.query.state as string,
      });

      const paginatedData = await getPublicPartnersRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Public partners retrieved successfully',
         data: paginatedData,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get a specific partner by ID
 */
export const getPartner = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getPartnerSchema.parse(req.params);

      const partner = await getPartnerByIdRepository(id);
      if (!partner) {
         res.status(404).json({
            success: false,
            message: 'Partner not found',
         });
         return;
      }

      // If public request (no admin auth), only show active partners
      if (!req.admin && partner.status !== 'ACTIVE') {
         res.status(404).json({
            success: false,
            message: 'Partner not found',
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Partner retrieved successfully',
         data: partner,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Update a partner (Admin only)
 */
export const updatePartner = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getPartnerSchema.parse(req.params);
      const updateData = updatePartnerSchema.parse({ id, ...req.body });
      const updatedById = req.admin!.id;

      const existingPartner = await getPartnerByIdRepository(id);
      if (!existingPartner) {
         res.status(404).json({
            success: false,
            message: 'Partner not found',
         });
         return;
      }

      // Check if new name already exists (if name is being updated)
      if (updateData.name && updateData.name !== existingPartner.name) {
         const nameExists = await checkPartnerNameExistsRepository(
            updateData.name,
            id
         );
         if (nameExists) {
            res.status(400).json({
               success: false,
               message: 'A partner with this name already exists',
            });
            return;
         }
      }

      const updatedPartner = await updatePartnerRepository(
         updateData,
         updatedById
      );

      res.status(200).json({
         success: true,
         message: 'Partner updated successfully',
         data: updatedPartner,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete a partner (Admin only)
 */
export const deletePartner = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getPartnerSchema.parse(req.params);

      const existingPartner = await getPartnerByIdRepository(id);
      if (!existingPartner) {
         res.status(404).json({
            success: false,
            message: 'Partner not found',
         });
         return;
      }

      await deletePartnerRepository(id);

      res.status(200).json({
         success: true,
         message: 'Partner deleted successfully',
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get featured partners for homepage
 */
export const getFeaturedPartners = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;

      const featuredPartners = await getFeaturedPartnersRepository(limit);

      res.status(200).json({
         success: true,
         message: 'Featured partners retrieved successfully',
         data: featuredPartners,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get partners by type
 */
export const getPartnersByType = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { type } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

      const partners = await getPartnersByTypeRepository(
         type as PartnerType,
         limit
      );

      res.status(200).json({
         success: true,
         message: `${type} partners retrieved successfully`,
         data: partners,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get partner statistics (Admin only)
 */
export const getPartnerStats = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const stats = await getPartnerStatsRepository();

      res.status(200).json({
         success: true,
         message: 'Partner statistics retrieved successfully',
         data: stats,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Update partner display order (Admin only)
 */
export const updatePartnerDisplayOrder = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getPartnerSchema.parse(req.params);
      const { displayOrder } = req.body;
      const updatedById = req.admin!.id;

      if (typeof displayOrder !== 'number' || displayOrder < 0) {
         res.status(400).json({
            success: false,
            message: 'Display order must be a non-negative number',
         });
         return;
      }

      const existingPartner = await getPartnerByIdRepository(id);
      if (!existingPartner) {
         res.status(404).json({
            success: false,
            message: 'Partner not found',
         });
         return;
      }

      const updatedPartner = await updatePartnerDisplayOrderRepository(
         id,
         displayOrder,
         updatedById
      );

      res.status(200).json({
         success: true,
         message: 'Partner display order updated successfully',
         data: updatedPartner,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Bulk update partner status (Admin only)
 */
export const bulkUpdatePartnerStatus = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { partnerIds, status } = req.body;
      const updatedById = req.admin!.id;

      if (!Array.isArray(partnerIds) || partnerIds.length === 0) {
         res.status(400).json({
            success: false,
            message: 'Partner IDs array is required',
         });
         return;
      }

      if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
         res.status(400).json({
            success: false,
            message: 'Invalid status. Must be ACTIVE, INACTIVE, or PENDING',
         });
         return;
      }

      const result = await bulkUpdatePartnerStatusRepository(
         partnerIds,
         status,
         updatedById
      );

      res.status(200).json({
         success: true,
         message: `${result.count} partners updated successfully`,
         data: { updatedCount: result.count },
      });
   } catch (error) {
      next(error);
   }
};
