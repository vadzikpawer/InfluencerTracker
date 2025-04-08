import express, { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertUserSchema, 
  insertInfluencerSchema, 
  insertProjectSchema, 
  insertCommentSchema, 
  insertActivitySchema,
  insertScenarioSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication with session and password hashing
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Не авторизован" });
  };

  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Influencer routes
  app.get("/api/influencers", isAuthenticated, async (req, res) => {
    try {
      const influencers = await storage.getInfluencers();
      res.json(influencers);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/influencers", isAuthenticated, async (req, res) => {
    try {
      const influencerData = insertInfluencerSchema.parse(req.body);
      const influencer = await storage.createInfluencer(influencerData);
      res.status(201).json(influencer);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      // Special case for "new" route - return empty template
      if (req.params.id === 'new') {
        return res.json({
          title: '',
          client: '',
          description: '',
          status: 'active',
          workflowStage: 'scenario',
          budget: null,
          erid: null,
          platforms: [],
          technicalLinks: []
        });
      }
      
      const project = await storage.getProject(Number(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      
      const updatedProject = await storage.updateProject(id, req.body);
      
      // Create activity log if workflow stage is updated
      if (req.body.workflowStage && req.body.workflowStage !== project.workflowStage) {
        const userId = (req.user as any).id;
        const stageNames = {
          scenario: "Сценарий",
          material: "Материалы",
          publication: "Публикация"
        };
        
        const oldStageName = stageNames[project.workflowStage as keyof typeof stageNames] || "Создание";
        const newStageName = stageNames[req.body.workflowStage as keyof typeof stageNames];
        
        await storage.createActivity({
          projectId: id,
          userId,
          activityType: "workflow_update",
          description: `Статус проекта изменен: ${oldStageName} → ${newStageName}`
        });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });
  
  // Endpoint to update project workflow stage
  app.post("/api/projects/:id/workflow-stage", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { stage } = req.body;
      
      if (!stage || !["scenario", "material", "publication"].includes(stage)) {
        return res.status(400).json({ message: "Некорректный этап проекта" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      
      const updatedProject = await storage.updateProject(id, { workflowStage: stage });
      
      // Create activity log for the stage change
      const userId = (req.user as any).id;
      const stageNames = {
        scenario: "Сценарий",
        material: "Материалы",
        publication: "Публикация"
      };
      
      const oldStageName = stageNames[project.workflowStage as keyof typeof stageNames] || "Создание";
      const newStageName = stageNames[stage as keyof typeof stageNames];
      
      await storage.createActivity({
        projectId: id,
        userId,
        activityType: "workflow_update",
        description: `Статус проекта изменен: ${oldStageName} → ${newStageName}`
      });
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Project influencers
  app.get("/api/projects/:id/influencers", isAuthenticated, async (req, res) => {
    try {
      // Special case for "new" route
      if (req.params.id === 'new') {
        return res.json([]);
      }
      
      const projectId = Number(req.params.id);
      const projectInfluencers = await storage.getProjectInfluencers(projectId);
      const influencerIds = projectInfluencers.map(pi => pi.influencerId);
      
      const influencers = await Promise.all(
        influencerIds.map(id => storage.getInfluencer(id))
      );
      
      res.json(influencers.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/projects/:id/influencers", isAuthenticated, async (req, res) => {
    try {
      // Make sure id is not 'new' for POST requests
      if (req.params.id === 'new') {
        return res.status(400).json({ message: "Недопустимый ID проекта" });
      }
      
      const projectId = Number(req.params.id);
      const { influencerId } = req.body;
      
      if (!influencerId) {
        return res.status(400).json({ message: "Требуется ID инфлюенсера" });
      }
      
      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      
      // Check if influencer exists
      const influencer = await storage.getInfluencer(Number(influencerId));
      if (!influencer) {
        return res.status(404).json({ message: "Инфлюенсер не найден" });
      }
      
      // Check if relationship already exists
      const existingRelation = await storage.getProjectInfluencer(projectId, Number(influencerId));
      if (existingRelation) {
        return res.status(400).json({ message: "Инфлюенсер уже добавлен к проекту" });
      }
      
      // Create the relationship
      await storage.createProjectInfluencer({
        projectId,
        influencerId: Number(influencerId),
        scenarioStatus: "pending",
        materialStatus: "pending",
        publicationStatus: "pending"
      });
      
      // Create activity log
      const userId = (req.user as any).id;
      const influencerName = influencer.nickname || influencer.id.toString();
      
      await storage.createActivity({
        projectId,
        userId,
        activityType: "influencer_added",
        description: `Инфлюенсер ${influencerName} добавлен к проекту`
      });
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  // Comments
  app.get("/api/projects/:id/comments", isAuthenticated, async (req, res) => {
    try {
      // Special case for "new" route
      if (req.params.id === 'new') {
        return res.json([]);
      }
      
      const projectId = Number(req.params.id);
      const comments = await storage.getCommentsByProject(projectId);
      
      // Get users for each comment
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? { id: user.id, name: user.name, role: user.role } : undefined
          };
        })
      );
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/projects/:id/comments", isAuthenticated, async (req, res) => {
    try {
      // Make sure id is not 'new' for POST requests
      if (req.params.id === 'new') {
        return res.status(400).json({ message: "Недопустимый ID проекта" });
      }
      
      const projectId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        projectId,
        userId
      });
      
      const comment = await storage.createComment(commentData);
      const user = await storage.getUser(comment.userId);
      
      res.status(201).json({
        ...comment,
        user: user ? { id: user.id, name: user.name, role: user.role } : undefined
      });
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Activities
  app.get("/api/activities/recent", isAuthenticated, async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const activities = await storage.getRecentActivities(limit);
      
      // Get users and projects for each activity
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = activity.userId ? await storage.getUser(activity.userId) : null;
          const project = await storage.getProject(activity.projectId);
          
          return {
            ...activity,
            user: user ? { id: user.id, name: user.name, role: user.role } : null,
            project: project ? { id: project.id, title: project.title, client: project.client } : null
          };
        })
      );
      
      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.get("/api/projects/:id/activities", isAuthenticated, async (req, res) => {
    try {
      // Special case for "new" route
      if (req.params.id === 'new') {
        return res.json([]);
      }
      
      const projectId = Number(req.params.id);
      const activities = await storage.getActivitiesByProject(projectId);
      
      // Get users for each activity
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = activity.userId ? await storage.getUser(activity.userId) : null;
          
          return {
            ...activity,
            user: user ? { id: user.id, name: user.name, role: user.role } : null
          };
        })
      );
      
      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/projects/:id/activities", isAuthenticated, async (req, res) => {
    try {
      // Make sure id is not 'new' for POST requests
      if (req.params.id === 'new') {
        return res.status(400).json({ message: "Недопустимый ID проекта" });
      }
      
      const projectId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const activityData = insertActivitySchema.parse({
        ...req.body,
        projectId,
        userId
      });
      
      const activity = await storage.createActivity(activityData);
      
      // Handle nullable userId since the field can be null in the schema
      let user = undefined;
      if (activity.userId !== null && activity.userId !== undefined) {
        user = await storage.getUser(activity.userId);
      }
      
      res.status(201).json({
        ...activity,
        user: user ? { id: user.id, name: user.name, role: user.role } : null
      });
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Dashboard stats
  app.get("/api/stats/manager", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const projects = await storage.getProjectsByManagerId(userId);
      
      const activeProjects = projects.filter(p => p.status === "active").length;
      const completedProjects = projects.filter(p => p.status === "completed").length;
      
      // Get all influencers
      const influencers = await storage.getInfluencers();
      
      // Calculate projects requiring attention
      const pendingReviews = {
        scenario: 0,
        material: 0,
        publication: 0
      };
      
      projects.forEach(project => {
        if (project.status === "active") {
          if (project.workflowStage === "scenario") {
            pendingReviews.scenario++;
          } else if (project.workflowStage === "material") {
            pendingReviews.material++;
          } else if (project.workflowStage === "publication") {
            pendingReviews.publication++;
          }
        }
      });
      
      res.json({
        activeProjects,
        completedProjects,
        influencersCount: influencers.length,
        pendingReviews: pendingReviews.scenario + pendingReviews.material + pendingReviews.publication,
        pendingReviewsDetails: pendingReviews
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.get("/api/stats/influencer", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const influencer = await storage.getInfluencerByUserId(userId);
      
      if (!influencer) {
        return res.status(404).json({ message: "Профиль инфлюенсера не найден" });
      }
      
      const projectInfluencers = await storage.getInfluencerProjects(influencer.id);
      const projectIds = projectInfluencers.map(pi => pi.projectId);
      
      const projects = await Promise.all(
        projectIds.map(id => storage.getProject(id))
      );
      
      const activeProjects = projects.filter(p => p && p.status === "active").length;
      const completedProjects = projects.filter(p => p && p.status === "completed").length;
      
      // Calculate projects requiring action
      const needsAction = projectInfluencers.filter(pi => {
        const isScenarioPending = pi.scenarioStatus === "pending" || pi.scenarioStatus === "rejected";
        const isMaterialPending = pi.materialStatus === "pending" || pi.materialStatus === "rejected";
        const isPublicationPending = pi.publicationStatus === "pending";
        
        return isScenarioPending || isMaterialPending || isPublicationPending;
      }).length;
      
      // For demo, calculate a monthly income
      const monthlyIncome = 120000; // Fixed for demo
      
      res.json({
        activeProjects,
        completedProjects,
        needsAction,
        monthlyIncome
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  // Scenario routes
  app.get("/api/projects/:id/scenarios", isAuthenticated, async (req, res) => {
    try {
      // Special case for "new" route
      if (req.params.id === 'new') {
        return res.json([]);
      }
      
      const projectId = Number(req.params.id);
      const scenarios = await storage.getScenariosByProject(projectId);
      
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

  app.post("/api/projects/:id/scenarios", isAuthenticated, async (req, res) => {
    try {
      // Make sure id is not 'new' for POST requests
      if (req.params.id === 'new') {
        return res.status(400).json({ message: "Недопустимый ID проекта" });
      }
      
      const projectId = Number(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      
      // Get project influencers to select the first one
      const projectInfluencers = await storage.getProjectInfluencers(projectId);
      
      if (projectInfluencers.length === 0) {
        return res.status(400).json({ message: "Необходимо добавить инфлюенсеров к проекту перед созданием сценария" });
      }
      
      // Use the first influencer for this scenario
      const influencerId = projectInfluencers[0].influencerId;
      
      const scenarioData = insertScenarioSchema.parse({
        ...req.body,
        projectId,
        influencerId
      });
      
      const scenario = await storage.createScenario(scenarioData);
      
      // Create activity for scenario creation
      const userId = (req.user as any).id;
      await storage.createActivity({
        projectId,
        userId,
        activityType: "scenario_create",
        description: "Создан новый сценарий"
      });
      
      res.status(201).json(scenario);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
