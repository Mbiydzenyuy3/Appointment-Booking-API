// import Joi from "joi";

// export const bookAppointmentSchema = Joi.object({
//   providerId: Joi.string().uuid().required(),
//   slotId: Joi.string().uuid().required(),
// });

// export const cancelAppointmentSchema = Joi.object({
//   appointmentId: Joi.string().uuid().required(),
// });

import Joi from "joi";

const appointmentSchema = Joi.object({
  userId: Joi.number().required(),
  slotId: Joi.number().required(),
});

export const appointmentValidator = (req, res, next) => {
  const { error } = appointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
