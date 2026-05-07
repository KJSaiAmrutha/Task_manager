import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, deadline, members } = req.body;
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        members: {
          create: members?.map((userId: string) => ({ userId })) || [],
        }
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : {
        members: { some: { userId: req.user?.id } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true } } } }
      }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, deadline, status, members } = req.body;
    
    // First, update simple fields
    await prisma.project.update({
      where: { id: req.params.id as string },
      data: {
        name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        status,
      }
    });

    // If members are provided, reset members
    if (members) {
      await prisma.projectMember.deleteMany({ where: { projectId: req.params.id as string } });
      await prisma.projectMember.createMany({
        data: members.map((userId: string) => ({ userId, projectId: req.params.id as string }))
      });
    }

    const updatedProject = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: { members: { include: { user: { select: { id: true, name: true } } } } }
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
