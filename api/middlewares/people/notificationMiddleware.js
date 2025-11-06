import { body } from 'express-validator';

export const validateInviteAction = [
    body('notification_id')
        .notEmpty()
        .withMessage('Notification ID is required')
        .isMongoId()
        .withMessage('Invalid notification ID format'),
    
    body('action')
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['accept', 'ignore'])
        .withMessage('Action must be either accept or ignore')
]; 