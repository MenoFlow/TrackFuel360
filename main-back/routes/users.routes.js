const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUserSchema, updateUserSchema, loginSchema } = require('../validators/user.validator');

const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production';

router.get('/', async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT id, email, matricule, nom, prenom, role, site_id FROM users');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await createUserSchema.validateAsync(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, matricule, nom, prenom, role, site_id, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.email, data.matricule, data.nom, data.prenom, data.role, data.site_id, hashedPassword]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Identifiants invalides' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = await updateUserSchema.validateAsync(req.body);

    // Vérifie si l'utilisateur existe
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Si mot de passe fourni, le hasher
    if (updateData.password) {
      const hash = await bcrypt.hash(updateData.password, 10);
      updateData.password_hash = hash;
      delete updateData.password;
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map(f => `${f} = ?`).join(', ');

    await db.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    const [updated] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).send(); // Pas de contenu, suppression réussie
  } catch (error) {
    next(error);
  }
});

module.exports = router;
