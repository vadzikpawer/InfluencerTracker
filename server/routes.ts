import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertInfluencerSchema, insertProjectSchema, insertCommentSchema, insertActivitySchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "influencer-marketing-platform-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Неверное имя пользователя" });
        }
        
        // Simple password check for demo (in a real app would use bcrypt)
        if (user.password !== password) {
          return done(null, false, { message: "Неверный пароль" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Не авторизован" });
    }
  });

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
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Некорректные данные", error });
    }
  });

  // Project influencers
  app.get("/api/projects/:id/influencers", isAuthenticated, async (req, res) => {
    try {
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

  // Comments
  app.get("/api/projects/:id/comments", isAuthenticated, async (req, res) => {
    try {
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
      const projectId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const activityData = insertActivitySchema.parse({
        ...req.body,
        projectId,
        userId
      });
      
      const activity = await storage.createActivity(activityData);
      const user = await storage.getUser(activity.userId);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
