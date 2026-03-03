import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { landingService } from '../services/landing.service';

const router = Router();

router.get('/public/:slug', async (req, res, next) => {
  try {
    const data = await landingService.getPublicSections(req.params.slug);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.post('/public/:slug/lead', async (req, res, next) => {
  try {
    const data = await landingService.submitPublicLead(req.params.slug, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'));

router.get('/sections', async (req: any, res, next) => {
  try {
    const data = await landingService.getSections(req.user.academyId);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});
router.post('/sections', async (req: any, res, next) => {
  try {
    const data = await landingService.createSection(req.user.academyId, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (e) { next(e); }
});
router.put('/sections/reorder', async (req: any, res, next) => {
  try {
    const data = await landingService.reorderSections(req.user.academyId, req.body.orders);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});
router.put('/sections/:id', async (req: any, res, next) => {
  try {
    const data = await landingService.updateSection(req.user.academyId, req.params.id, req.body);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});
router.patch('/sections/:id/toggle', async (req: any, res, next) => {
  try {
    const data = await landingService.toggleSection(req.user.academyId, req.params.id);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});
router.delete('/sections/:id', async (req: any, res, next) => {
  try {
    await landingService.deleteSection(req.user.academyId, req.params.id);
    res.json({ status: 'success', message: 'Section deleted' });
  } catch (e) { next(e); }
});

router.get('/trainers', async (req: any, res, next) => {
  try {
    const data = await landingService.getTrainers(req.user.academyId);
    res.json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.post('/sections/:id/media', async (req: any, res, next) => {
  try {
    const data = await landingService.addMedia(req.user.academyId, req.params.id, req.body);
    res.status(201).json({ status: 'success', data });
  } catch (e) { next(e); }
});

router.delete('/media/:id', async (req: any, res, next) => {
  try {
    await landingService.deleteMedia(req.user.academyId, req.params.id);
    res.json({ status: 'success', message: 'Media deleted' });
  } catch (e) { next(e); }
});

export default router;
