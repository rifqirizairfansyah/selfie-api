const joi = require("@hapi/joi");

const registrationAdminScheme = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
    role: joi.string().min(3).required(),
    type: joi.string().min(3).required(),
    company_name: joi.string().min(3).required(),
    company_area: joi.string().min(3).required(),
    company_district: joi.string().min(3).required(),
    units: joi.array().min(1).required()
  });

const signUpScheme = joi
  .object({
    name: joi
      .string()
      .pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)
      .min(3)
      .max(50)
      .required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    position: joi.string().max(50).required(),
    id_card: joi.string().max(24).required(),
    company: joi.string().required(),
    local_image: joi.string(),
    unit: joi.string().required().required(),
    phone_number: joi
      .string()
      .pattern(/^[0-9]+$/)
      .min(10)
      .max(13)
      .required(),
    user_location_address: joi.string().max(100),
    user_location_long: joi.number().min(-180).max(180).required(),
    user_location_lat: joi.number().min(-90).max(90).required(),
    user_property_location_long: joi.number().min(-180).max(180).required(),
    user_property_location_lat: joi.number().min(-90).max(90).required()
  })
  .unknown();

const locationKeys = joi.object().keys({
  latitude: joi.number().min(-90).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  zoom: joi.number().min(1).max(18)
});

const nameKeys = joi.object().keys({
  area: joi
    .string()
    .max(50)
    .regex(/^\s*\w+(?:[^\w,]+\w+)*[^,\w]*$/),
  district: joi
    .string()
    .max(50)
    .regex(/^\s*\w+(?:[^\w,]+\w+)*[^,\w]*$/),
  company: joi
    .string()
    .max(50)
    .regex(/^\s*\w+(?:[^\w,]+\w+)*[^,\w]*$/),
  unit: joi
    .string()
    .max(50)
    .regex(/^\s*\w+(?:[^\w,]+\w+)*[^,\w]*$/)
    .required()
});

const updateAdminInformationScheme = joi.object({
  title: joi.string().alphanum().min(8).max(50),
  location: locationKeys,
  name: nameKeys,
  presence_hour: joi.string().regex(/^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/),
  leave_hour: joi.string().regex(/^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/)
});

const updateUserScheme = joi.object({
  name: joi
    .string()
    .pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)
    .min(3)
    .max(50)
    .required(),
  email: joi.string().email(),
  password: joi.string().min(5),
  position: joi.string().max(50),
  id_card: joi.string().max(24),
  company: joi.string(),
  unit: joi.string(),
  phone_number: joi
    .string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(13)
});

const updateCompanyProfileScheme = joi.object({
  name: joi
    .string()
    .pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)
    .min(3)
    .max(50)
    .required(),
  description: joi.string().max(500).required(),
  slug: joi.string().min(3).max(50).required(),
  institution: joi.string().max(500).required(),
  registrant_name: joi.string().max(50).required(),
  phone: joi.string().max(20).required()
});

const createCompanyProfileScheme = joi.object({
  name: joi
    .string()
    .pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)
    .min(3)
    .max(50)
    .required(),
  description: joi.string().max(500).required(),
  company_guid: joi.string().max(500).required(),
  institution: joi.string().max(500).required(),
  slug: joi.string().min(3).max(50).required(),
  registrant_name: joi.string().max(50).required(),
  phone: joi.string().max(20).required()
});

module.exports = {
  signUpScheme,
  createCompanyProfileScheme,
  registrationAdminScheme,
  updateAdminInformationScheme,
  updateUserScheme,
  updateCompanyProfileScheme
};
