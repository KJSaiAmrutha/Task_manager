import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, description, priority, deadline, projectId, userId } = req.body;
    
    // Check if user is admin or belongs to the project
    if (req.user?.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: req.user?.id }
      });
      if (!isMember) return res.status(403).json({ message: 'Not authorized for this project' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        projectId,
        userId
      },
      include: { assignee: { select: { id: true, name: true, email: true } }, project: { select: { name: true } } }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { projectId } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    const whereClause: any = {};
    if (projectId) whereClause.projectId = String(projectId);
    if (!isAdmin) {
      whereClause.project = { members: { some: { userId: req.user?.id } } };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: { assignee: { select: { id: true, name: true } }, project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, description, priority, status, deadline, userId } = req.body;
    const task = await prisma.task.findUnique({ where: { id: req.params.id as string } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Users can only update tasks in projects they belong to
    if (req.user?.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId: req.user?.id }
      });
      if (!isMember) return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id as string },
      data: { title, description, priority, status, deadline: deadline ? new Date(deadline) : undefined, userId },
      include: { assignee: { select: { id: true, name: true } }, project: { select: { name: true } } }
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
