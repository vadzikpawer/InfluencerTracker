import { db } from './db';
import { 
  users, 
  influencers, 
  projects, 
  projectInfluencers, 
  scenarios, 
  comments, 
  activities 
} from '@shared/schema';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Data already exists, skipping seeding');
      return;
    }

    // Create manager user
    const [manager] = await db.insert(users).values({
      username: "manager",
      password: "password",
      name: "Алексей Смирнов",
      role: "manager",
      profileImage: null
    }).returning();
    
    console.log('Created manager:', manager.id);
    
    // Create influencer user
    const [influencer1] = await db.insert(users).values({
      username: "influencer1",
      password: "password",
      name: "Екатерина Котова",
      role: "influencer",
      profileImage: null
    }).returning();
    
    console.log('Created influencer user:', influencer1.id);
    
    // Create influencer profile
    const [influencerProfile] = await db.insert(influencers).values({
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
    }).returning();
    
    console.log('Created influencer profile:', influencerProfile.id);
    
    // Create projects
    const [project1] = await db.insert(projects).values({
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
      ]
    }).returning();
    
    console.log('Created project 1:', project1.id);
    
    // Create project-influencer relationship
    const [projectInfluencer1] = await db.insert(projectInfluencers).values({
      projectId: project1.id,
      influencerId: influencerProfile.id,
      scenarioStatus: "approved",
      materialStatus: "in_review",
      publicationStatus: "pending",
      scenarioCompletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      materialCompletedAt: null,
      publicationCompletedAt: null
    }).returning();
    
    console.log('Created project-influencer relationship:', projectInfluencer1.id);
    
    // Create scenario
    const [scenario1] = await db.insert(scenarios).values({
      projectId: project1.id,
      influencerId: influencerProfile.id,
      content: "1. Приветствие и представление приложения TravelBuddy\n2. Краткий рассказ о планировании предстоящего отпуска\n3. Демонстрация поиска и бронирования отеля через приложение\n4. Демонстрация поиска и бронирования авиабилетов\n5. Показ функции сохранения билетов и бронирований в личном кабинете\n6. Упоминание уникального скидочного кода TRAVEL2023\n7. Призыв к действию: скачать приложение в App Store и Google Play",
      status: "approved",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      version: 1
    }).returning();
    
    console.log('Created scenario:', scenario1.id);
    
    // Create comments
    const [comment1] = await db.insert(comments).values({
      projectId: project1.id,
      userId: manager.id,
      content: "Нужно обязательно упомянуть, что у приложения есть функция офлайн-карт для путешествий без интернета. Это важное преимущество."
    }).returning();
    
    console.log('Created comment 1:', comment1.id);
    
    const [comment2] = await db.insert(comments).values({
      projectId: project1.id,
      userId: influencer1.id,
      content: "Добавила пункт про офлайн-карты в сценарий. Также усилила часть с демонстрацией интерфейса."
    }).returning();
    
    console.log('Created comment 2:', comment2.id);
    
    // Create activities
    const [activity1] = await db.insert(activities).values({
      projectId: project1.id,
      userId: manager.id,
      activityType: "scenario_approved",
      description: "Сценарий утвержден"
    }).returning();
    
    console.log('Created activity 1:', activity1.id);
    
    const [activity2] = await db.insert(activities).values({
      projectId: project1.id,
      userId: influencer1.id,
      activityType: "material_submitted",
      description: "Материал отправлен на проверку"
    }).returning();
    
    console.log('Created activity 2:', activity2.id);
    
    // Create second project
    const [project2] = await db.insert(projects).values({
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
      ]
    }).returning();
    
    console.log('Created project 2:', project2.id);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Execute the seed function
seed();