const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama lengkap harus antara 2-100 karakter'),
  body('phoneNumber')
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/)
    .withMessage('Nomor telepon tidak valid'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'),
  handleValidationErrors
];

const validateLogin = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Nomor telepon diperlukan'),
  body('password')
    .notEmpty()
    .withMessage('Password diperlukan'),
  handleValidationErrors
];

const validateQueueBooking = [
  body('appointmentDate')
    .isISO8601()
    .withMessage('Format tanggal tidak valid')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Tanggal appointment tidak boleh di masa lalu');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateQueueBooking,
  handleValidationErrors
};