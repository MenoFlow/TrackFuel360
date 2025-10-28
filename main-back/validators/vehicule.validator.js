/**
 * Schémas de validation pour les véhicules
 */

const Joi = require('joi');

const createVehiculeSchema = Joi.object({
  immatriculation: Joi.string().required().max(20),
  marque: Joi.string().required().max(50),
  modele: Joi.string().required().max(50),
  type: Joi.string().valid('essence', 'diesel', 'hybride', 'electrique', 'gpl').required(),
  capacite_reservoir: Joi.number().positive().required(),
  consommation_nominale: Joi.number().positive().required(),
  carburant_initial: Joi.number().min(0).required(),
  actif: Joi.boolean(),
  site_id: Joi.number().allow(null),
});

const updateVehiculeSchema = Joi.object({
  immatriculation: Joi.string().max(20),
  marque: Joi.string().max(50),
  modele: Joi.string().max(50),
  type: Joi.string().valid('essence', 'diesel', 'hybride', 'electrique', 'gpl'),
  capacite_reservoir: Joi.number().positive(),
  consommation_nominale: Joi.number().positive(),
  carburant_initial : Joi.number().min(0),
  actif: Joi.boolean(),
  site_id: Joi.number().allow(null),
}).min(1);

module.exports = {
  createVehiculeSchema,
  updateVehiculeSchema
};
