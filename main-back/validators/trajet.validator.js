/**
 * Schémas de validation pour les trajets
 */

const Joi = require('joi');

const createTripSchema = Joi.object({
  vehicule_id: Joi.string().required().max(50),
  chauffeur_id: Joi.string().required().max(50),
  date_debut: Joi.date().iso().required(),
  date_fin: Joi.date().iso().required(),
  distance_km: Joi.number().positive().required(),
  type_saisie: Joi.string().valid('auto', 'manuelle').default('manuelle'),
  traceGps: Joi.array().items(
    Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      timestamp: Joi.date().iso().required()
    })
  ).default([]) // tableau vide par défaut si non fourni
});


const updateTripSchema = Joi.object({
  vehicule_id: Joi.string().max(50),
  chauffeur_id: Joi.string().max(50),
  date_debut: Joi.date().iso(),
  date_fin: Joi.date().iso(),
  distance_km: Joi.number().positive(),
  type_saisie: Joi.string().valid('auto', 'manuelle'),
  traceGps: Joi.array().items(
    Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      timestamp: Joi.date().iso().required()
    })
  )
}).min(1); // au moins un champ requis pour PUT


module.exports = {
  createTripSchema,
  updateTripSchema
};
