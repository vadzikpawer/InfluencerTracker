import { activities, type Activity, type InsertActivity } from "@shared/schema";
import { comments, type Comment, type InsertComment } from "@shared/schema";
import { influencers, type Influencer, type InsertInfluencer } from "@shared/schema";
import { materials, type Material, type InsertMaterial } from "@shared/schema";
import { projects, type Project, type InsertProject } from "@shared/schema";
import { projectInfluencers, type ProjectInfluencer, type InsertProjectInfluencer } from "@shared/schema";
import { publications, type Publication, type InsertPublication } from "@shared/schema";
import { scenarios, type Scenario, type InsertScenario } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Influencer operations
  getInfluencer(id: number): Promise<Influencer | undefined>;
  getInfluencerByUserId(userId: number): Promise<Influencer | undefined>;
  createInfluencer(influencer: InsertInfluencer): Promise<Influencer>;
  getInfluencers(): Promise<Influencer[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectsByManagerId(managerId: number): Promise<Project[]>;
  
  // Project-Influencer operations
  getProjectInfluencer(projectId: number, influencerId: number): Promise<ProjectInfluencer | undefined>;
  getProjectInfluencers(projectId: number): Promise<ProjectInfluencer[]>;
  getInfluencerProjects(influencerId: number): Promise<ProjectInfluencer[]>;
  createProjectInfluencer(projectInfluencer: InsertProjectInfluencer): Promise<ProjectInfluencer>;
  updateProjectInfluencer(id: number, projectInfluencer: Partial<ProjectInfluencer>): Promise<ProjectInfluencer | undefined>;
  
  // Scenario operations
  getScenario(id: number): Promise<Scenario | undefined>;
  getScenariosByProject(projectId: number): Promise<Scenario[]>;
  getScenariosByInfluencer(influencerId: number): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: number, scenario: Partial<Scenario>): Promise<Scenario | undefined>;
  
  // Material operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialsByProject(projectId: number): Promise<Material[]>;
  getMaterialsByInfluencer(influencerId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<Material>): Promise<Material | undefined>;
  
  // Publication operations
  getPublication(id: number): Promise<Publication | undefined>;
  getPublicationsByProject(projectId: number): Promise<Publication[]>;
  getPublicationsByInfluencer(influencerId: number): Promise<Publication[]>;
  createPublication(publication: InsertPublication): Promise<Publication>;
  updatePublication(id: number, publication: Partial<Publication>): Promise<Publication | undefined>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByProject(projectId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Activity operations
  getActivitiesByProject(projectId: number): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private influencers: Map<number, Influencer>;
  private projects: Map<number, Project>;
  private projectInfluencers: Map<number, ProjectInfluencer>;
  private scenarios: Map<number, Scenario>;
  private materials: Map<number, Material>;
  private publications: Map<number, Publication>;
  private comments: Map<number, Comment>;
  private activities: Map<number, Activity>;
  
  private userIdCounter = 1;
  private influencerIdCounter = 1;
  private projectIdCounter = 1;
  private projectInfluencerIdCounter = 1;
  private scenarioIdCounter = 1;
  private materialIdCounter = 1;
  private publicationIdCounter = 1;
  private commentIdCounter = 1;
  private activityIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.influencers = new Map();
    this.projects = new Map();
    this.projectInfluencers = new Map();
    this.scenarios = new Map();
    this.materials = new Map();
    this.publications = new Map();
    this.comments = new Map();
    this.activities = new Map();
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create manager user
    const manager: User = {
      id: this.userIdCounter++,
      username: "manager",
      password: "password",
      name: "Алексей Смирнов",
      role: "manager",
      profileImage: null,
      createdAt: new Date()
    };
    this.users.set(manager.id, manager);
    
    // Create influencer user
    const influencer1: User = {
      id: this.userIdCounter++,
      username: "influencer1",
      password: "password",
      name: "Екатерина Котова",
      role: "influencer",
      profileImage: null,
      createdAt: new Date()
    };
    this.users.set(influencer1.id, influencer1);
    
    // Create influencer profile
    const influencerProfile: Influencer = {
      id: this.influencerIdCounter++,
      userId: influencer1.id,
      nickname: "travel_kate",
      bio: "Путешественница и блогер",
      instagramHandle: "travel_kate",
      instagramFollowers: 250000,
      tiktokHandle: "travel_kate",
      tiktokFollowers: 180000,
      youtubeHandle: "TravelKateOfficial",
      youtubeFollowers: 120000,
      telegramHandle: "travel_kate",
      telegramFollowers: 50000,
      vkHandle: "travel_kate",
      vkFollowers: 100000
    };
    this.influencers.set(influencerProfile.id, influencerProfile);
    
    // Create projects
    const project1: Project = {
      id: this.projectIdCounter++,
      title: "Рекламная кампания мобильного приложения",
      client: "TravelBuddy",
      description: "Рекламная кампания для мобильного приложения TravelBuddy. Цель - увеличение скачиваний приложения и привлечение новой аудитории перед летним сезоном отпусков.",
      startDate: new Date(),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: "active",
      workflowStage: "scenario",
      budget: 350000,
      erid: "TRV2023-05",
      managerId: manager.id,
      platforms: ["instagram", "tiktok"],
      technicalLinks: [
        { title: "Материалы клиента", url: "https://drive.google.com/folder/12345" },
        { title: "Бриф проекта", url: "https://docs.google.com/document/12345" }
      ],
      createdAt: new Date()
    };
    this.projects.set(project1.id, project1);
    
    // Create project-influencer relationship
    const projectInfluencer1: ProjectInfluencer = {
      id: this.projectInfluencerIdCounter++,
      projectId: project1.id,
      influencerId: influencerProfile.id,
      scenarioStatus: "approved",
      materialStatus: "in_review",
      publicationStatus: "pending",
      scenarioCompletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      materialCompletedAt: null,
      publicationCompletedAt: null
    };
    this.projectInfluencers.set(projectInfluencer1.id, projectInfluencer1);
    
    // Create scenario
    const scenario1: Scenario = {
      id: this.scenarioIdCounter++,
      projectId: project1.id,
      influencerId: influencerProfile.id,
      content: "1. Приветствие и представление приложения TravelBuddy\n2. Краткий рассказ о планировании предстоящего отпуска\n3. Демонстрация поиска и бронирования отеля через приложение\n4. Демонстрация поиска и бронирования авиабилетов\n5. Показ функции сохранения билетов и бронирований в личном кабинете\n6. Упоминание уникального скидочного кода TRAVEL2023\n7. Призыв к действию: скачать приложение в App Store и Google Play",
      status: "approved",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      version: 1
    };
    this.scenarios.set(scenario1.id, scenario1);
    
    // Create comments
    const comment1: Comment = {
      id: this.commentIdCounter++,
      projectId: project1.id,
      userId: manager.id,
      content: "Нужно обязательно упомянуть, что у приложения есть функция офлайн-карт для путешествий без интернета. Это важное преимущество.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    };
    this.comments.set(comment1.id, comment1);
    
    const comment2: Comment = {
      id: this.commentIdCounter++,
      projectId: project1.id,
      userId: influencer1.id,
      content: "Добавила пункт про офлайн-карты в сценарий. Также усилила часть с демонстрацией интерфейса.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    };
    this.comments.set(comment2.id, comment2);
    
    // Create activities
    const activity1: Activity = {
      id: this.activityIdCounter++,
      projectId: project1.id,
      userId: manager.id,
      activityType: "scenario_approved",
      description: "Сценарий утвержден",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    this.activities.set(activity1.id, activity1);
    
    const activity2: Activity = {
      id: this.activityIdCounter++,
      projectId: project1.id,
      userId: influencer1.id,
      activityType: "material_submitted",
      description: "Материал отправлен на проверку",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    };
    this.activities.set(activity2.id, activity2);
    
    // Create second project
    const project2: Project = {
      id: this.projectIdCounter++,
      title: "Обзор новой модели наушников",
      client: "SoundMaster",
      description: "Обзор новой линейки наушников с акцентом на качество звука и шумоподавление.",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "active",
      workflowStage: "material",
      budget: 200000,
      erid: "SND2023-02",
      managerId: manager.id,
      platforms: ["youtube", "telegram"],
      technicalLinks: [
        { title: "Технические характеристики", url: "https://drive.google.com/folder/67890" }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    };
    this.projects.set(project2.id, project2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id, 
      profileImage: user.profileImage || null,
      createdAt: new Date() 
    } as User;
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Influencer operations
  async getInfluencer(id: number): Promise<Influencer | undefined> {
    return this.influencers.get(id);
  }

  async getInfluencerByUserId(userId: number): Promise<Influencer | undefined> {
    return Array.from(this.influencers.values()).find(
      (influencer) => influencer.userId === userId,
    );
  }

  async createInfluencer(influencer: InsertInfluencer): Promise<Influencer> {
    const id = this.influencerIdCounter++;
    const newInfluencer: Influencer = { ...influencer, id } as Influencer;
    this.influencers.set(id, newInfluencer);
    return newInfluencer;
  }
  
  async getInfluencers(): Promise<Influencer[]> {
    return Array.from(this.influencers.values());
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { 
      ...project, 
      id, 
      status: project.status || 'draft',
      workflowStage: project.workflowStage || 'scenario',
      description: project.description || null,
      platforms: project.platforms || null,
      createdAt: new Date() 
    } as Project;
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getProjectsByManagerId(managerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.managerId === managerId,
    );
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Delete all related items
    this.comments = new Map([...this.comments].filter(([_, comment]) => comment.projectId !== id));
    this.activities = new Map([...this.activities].filter(([_, activity]) => activity.projectId !== id));
    this.scenarios = new Map([...this.scenarios].filter(([_, scenario]) => scenario.projectId !== id));
    this.materials = new Map([...this.materials].filter(([_, material]) => material.projectId !== id));
    this.publications = new Map([...this.publications].filter(([_, publication]) => publication.projectId !== id));
    this.projectInfluencers = new Map([...this.projectInfluencers].filter(([_, pi]) => pi.projectId !== id));
    
    // Delete the project itself
    const result = this.projects.delete(id);
    return result;
  }

  // Project-Influencer operations
  async getProjectInfluencer(projectId: number, influencerId: number): Promise<ProjectInfluencer | undefined> {
    return Array.from(this.projectInfluencers.values()).find(
      (pi) => pi.projectId === projectId && pi.influencerId === influencerId,
    );
  }

  async getProjectInfluencers(projectId: number): Promise<ProjectInfluencer[]> {
    return Array.from(this.projectInfluencers.values()).filter(
      (pi) => pi.projectId === projectId,
    );
  }

  async getInfluencerProjects(influencerId: number): Promise<ProjectInfluencer[]> {
    return Array.from(this.projectInfluencers.values()).filter(
      (pi) => pi.influencerId === influencerId,
    );
  }

  async createProjectInfluencer(projectInfluencer: InsertProjectInfluencer): Promise<ProjectInfluencer> {
    const id = this.projectInfluencerIdCounter++;
    const newProjectInfluencer: ProjectInfluencer = { 
      ...projectInfluencer, 
      id,
      scenarioStatus: projectInfluencer.scenarioStatus || 'pending',
      materialStatus: projectInfluencer.materialStatus || 'pending',
      publicationStatus: projectInfluencer.publicationStatus || 'pending',
      scenarioCompletedAt: projectInfluencer.scenarioCompletedAt || null,
      materialCompletedAt: projectInfluencer.materialCompletedAt || null,
      publicationCompletedAt: projectInfluencer.publicationCompletedAt || null
    } as ProjectInfluencer;
    this.projectInfluencers.set(id, newProjectInfluencer);
    return newProjectInfluencer;
  }

  async updateProjectInfluencer(id: number, projectInfluencer: Partial<ProjectInfluencer>): Promise<ProjectInfluencer | undefined> {
    const existing = this.projectInfluencers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...projectInfluencer };
    this.projectInfluencers.set(id, updated);
    return updated;
  }

  // Scenario operations
  async getScenario(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async getScenariosByProject(projectId: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(
      (scenario) => scenario.projectId === projectId,
    );
  }

  async getScenariosByInfluencer(influencerId: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(
      (scenario) => scenario.influencerId === influencerId,
    );
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const id = this.scenarioIdCounter++;
    const newScenario: Scenario = { ...scenario, id };
    this.scenarios.set(id, newScenario);
    return newScenario;
  }

  async updateScenario(id: number, scenario: Partial<Scenario>): Promise<Scenario | undefined> {
    const existing = this.scenarios.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...scenario };
    this.scenarios.set(id, updated);
    return updated;
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterialsByProject(projectId: number): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.projectId === projectId,
    );
  }

  async getMaterialsByInfluencer(influencerId: number): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.influencerId === influencerId,
    );
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const id = this.materialIdCounter++;
    const newMaterial: Material = { ...material, id };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async updateMaterial(id: number, material: Partial<Material>): Promise<Material | undefined> {
    const existing = this.materials.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...material };
    this.materials.set(id, updated);
    return updated;
  }

  // Publication operations
  async getPublication(id: number): Promise<Publication | undefined> {
    return this.publications.get(id);
  }

  async getPublicationsByProject(projectId: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      (publication) => publication.projectId === projectId,
    );
  }

  async getPublicationsByInfluencer(influencerId: number): Promise<Publication[]> {
    return Array.from(this.publications.values()).filter(
      (publication) => publication.influencerId === influencerId,
    );
  }

  async createPublication(publication: InsertPublication): Promise<Publication> {
    const id = this.publicationIdCounter++;
    const newPublication: Publication = { ...publication, id };
    this.publications.set(id, newPublication);
    return newPublication;
  }

  async updatePublication(id: number, publication: Partial<Publication>): Promise<Publication | undefined> {
    const existing = this.publications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...publication };
    this.publications.set(id, updated);
    return updated;
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByProject(projectId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = { ...comment, id, createdAt: new Date() };
    this.comments.set(id, newComment);
    return newComment;
  }

  // Activity operations
  async getActivitiesByProject(projectId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = { ...activity, id, createdAt: new Date() };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Influencer operations
  async getInfluencer(id: number): Promise<Influencer | undefined> {
    const [influencer] = await db.select().from(influencers).where(eq(influencers.id, id));
    return influencer || undefined;
  }

  async getInfluencerByUserId(userId: number): Promise<Influencer | undefined> {
    const [influencer] = await db.select().from(influencers).where(eq(influencers.userId, userId));
    return influencer || undefined;
  }

  async createInfluencer(insertInfluencer: InsertInfluencer): Promise<Influencer> {
    const [influencer] = await db
      .insert(influencers)
      .values(insertInfluencer)
      .returning();
    return influencer;
  }

  async getInfluencers(): Promise<Influencer[]> {
    return await db.select().from(influencers);
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertProject,
      status: insertProject.status || 'draft',
      workflowStage: insertProject.workflowStage || 'scenario',
      description: insertProject.description || null,
      platforms: Array.isArray(insertProject.platforms) ? insertProject.platforms : null,
      deadline: insertProject.deadline || null,
      budget: insertProject.budget || null,
      erid: insertProject.erid || null,
      managerId: insertProject.managerId || null,
      technicalLinks: insertProject.technicalLinks || null
    };
    
    const [project] = await db
      .insert(projects)
      .values(formattedData)
      .returning();
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async getProjectsByManagerId(managerId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.managerId, managerId));
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Using a transaction to ensure all related deletions succeed or fail together
    await db.transaction(async (tx) => {
      // Delete project comments
      await tx
        .delete(comments)
        .where(eq(comments.projectId, id));
        
      // Delete project activities
      await tx
        .delete(activities)
        .where(eq(activities.projectId, id));
        
      // Delete project scenarios
      await tx
        .delete(scenarios)
        .where(eq(scenarios.projectId, id));
        
      // Delete project materials
      await tx
        .delete(materials)
        .where(eq(materials.projectId, id));
        
      // Delete project publications
      await tx
        .delete(publications)
        .where(eq(publications.projectId, id));
        
      // Delete project-influencer relationships
      await tx
        .delete(projectInfluencers)
        .where(eq(projectInfluencers.projectId, id));
        
      // Finally delete the project itself
      await tx
        .delete(projects)
        .where(eq(projects.id, id));
    });
    
    return true;
  }

  // Project-Influencer operations
  async getProjectInfluencer(projectId: number, influencerId: number): Promise<ProjectInfluencer | undefined> {
    const [projectInfluencer] = await db
      .select()
      .from(projectInfluencers)
      .where(
        and(
          eq(projectInfluencers.projectId, projectId),
          eq(projectInfluencers.influencerId, influencerId)
        )
      );
    return projectInfluencer || undefined;
  }

  async getProjectInfluencers(projectId: number): Promise<ProjectInfluencer[]> {
    return await db
      .select()
      .from(projectInfluencers)
      .where(eq(projectInfluencers.projectId, projectId));
  }

  async getInfluencerProjects(influencerId: number): Promise<ProjectInfluencer[]> {
    return await db
      .select()
      .from(projectInfluencers)
      .where(eq(projectInfluencers.influencerId, influencerId));
  }

  async createProjectInfluencer(insertProjectInfluencer: InsertProjectInfluencer): Promise<ProjectInfluencer> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertProjectInfluencer,
      scenarioStatus: insertProjectInfluencer.scenarioStatus || 'pending',
      materialStatus: insertProjectInfluencer.materialStatus || 'pending',
      publicationStatus: insertProjectInfluencer.publicationStatus || 'pending',
      scenarioCompletedAt: insertProjectInfluencer.scenarioCompletedAt || null,
      materialCompletedAt: insertProjectInfluencer.materialCompletedAt || null,
      publicationCompletedAt: insertProjectInfluencer.publicationCompletedAt || null
    };
    
    const [projectInfluencer] = await db
      .insert(projectInfluencers)
      .values(formattedData)
      .returning();
    return projectInfluencer;
  }

  async updateProjectInfluencer(id: number, update: Partial<ProjectInfluencer>): Promise<ProjectInfluencer | undefined> {
    const [updatedPI] = await db
      .update(projectInfluencers)
      .set(update)
      .where(eq(projectInfluencers.id, id))
      .returning();
    return updatedPI || undefined;
  }

  // Scenario operations
  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async getScenariosByProject(projectId: number): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.projectId, projectId));
  }

  async getScenariosByInfluencer(influencerId: number): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.influencerId, influencerId));
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertScenario,
      status: insertScenario.status || 'draft',
      submittedAt: insertScenario.submittedAt || null,
      approvedAt: insertScenario.approvedAt || null,
      version: insertScenario.version || 1
    };
    
    const [scenario] = await db
      .insert(scenarios)
      .values(formattedData)
      .returning();
    return scenario;
  }

  async updateScenario(id: number, update: Partial<Scenario>): Promise<Scenario | undefined> {
    const [updatedScenario] = await db
      .update(scenarios)
      .set(update)
      .where(eq(scenarios.id, id))
      .returning();
    return updatedScenario || undefined;
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async getMaterialsByProject(projectId: number): Promise<Material[]> {
    return await db
      .select()
      .from(materials)
      .where(eq(materials.projectId, projectId));
  }

  async getMaterialsByInfluencer(influencerId: number): Promise<Material[]> {
    return await db
      .select()
      .from(materials)
      .where(eq(materials.influencerId, influencerId));
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertMaterial,
      status: insertMaterial.status || 'draft',
      description: insertMaterial.description || null,
      submittedAt: insertMaterial.submittedAt || null,
      approvedAt: insertMaterial.approvedAt || null
    };
    
    const [material] = await db
      .insert(materials)
      .values(formattedData)
      .returning();
    return material;
  }

  async updateMaterial(id: number, update: Partial<Material>): Promise<Material | undefined> {
    const [updatedMaterial] = await db
      .update(materials)
      .set(update)
      .where(eq(materials.id, id))
      .returning();
    return updatedMaterial || undefined;
  }

  // Publication operations
  async getPublication(id: number): Promise<Publication | undefined> {
    const [publication] = await db.select().from(publications).where(eq(publications.id, id));
    return publication || undefined;
  }

  async getPublicationsByProject(projectId: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.projectId, projectId));
  }

  async getPublicationsByInfluencer(influencerId: number): Promise<Publication[]> {
    return await db
      .select()
      .from(publications)
      .where(eq(publications.influencerId, influencerId));
  }

  async createPublication(insertPublication: InsertPublication): Promise<Publication> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertPublication,
      status: insertPublication.status || 'published',
      verifiedAt: insertPublication.verifiedAt || null
    };
    
    const [publication] = await db
      .insert(publications)
      .values(formattedData)
      .returning();
    return publication;
  }

  async updatePublication(id: number, update: Partial<Publication>): Promise<Publication | undefined> {
    const [updatedPublication] = await db
      .update(publications)
      .set(update)
      .where(eq(publications.id, id))
      .returning();
    return updatedPublication || undefined;
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getCommentsByProject(projectId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.projectId, projectId))
      .orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Activity operations
  async getActivitiesByProject(projectId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.projectId, projectId))
      .orderBy(desc(activities.createdAt));
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    // Ensure all required fields have proper values
    const formattedData = {
      ...insertActivity,
      userId: insertActivity.userId || null
    };
    
    const [activity] = await db
      .insert(activities)
      .values(formattedData)
      .returning();
    return activity;
  }
}

// Initialize with MemStorage for development, switch to DatabaseStorage for production
export const storage = new DatabaseStorage();
