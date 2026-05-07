import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    // Total Projects
    const totalProjects = await prisma.project.count({
      where: isAdmin ? undefined : { members: { some: { userId: req.user?.id } } }
    });

    // Tasks counts
    const taskWhereClause = isAdmin ? {} : { project: { members: { some: { userId: req.user?.id } } } };
    
    const tasks = await prisma.task.findMany({
      where: taskWhereClause,
      select: { status: true, deadline: true }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now).length;

    // Recent activity (Last 5 tasks updated/created)
    const recentActivities = await prisma.task.findMany({
      where: taskWhereClause,
      include: { assignee: { select: { name: true } }, project: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
