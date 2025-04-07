import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      // Common
      "app_name": "InfluencerPro",
      "loading": "Загрузка...",
      "save": "Сохранить",
      "edit": "Редактировать",
      "delete": "Удалить",
      "cancel": "Отмена",
      "confirm": "Подтвердить",
      "submit": "Отправить",
      "upload": "Загрузить",
      "search": "Поиск",
      "filter": "Фильтр",
      "all": "Все",
      "none": "Нет",
      "view": "Просмотреть",
      "open": "Открыть",
      "close": "Закрыть",
      "add": "Добавить",
      "remove": "Удалить",
      
      // Auth
      "login": "Вход",
      "logout": "Выход",
      "username": "Имя пользователя",
      "password": "Пароль",
      "sign_in": "Войти",
      "unauthorized": "Не авторизован",
      "invalid_credentials": "Неверные учетные данные",
      
      // Navigation
      "dashboard": "Дашборд",
      "projects": "Проекты",
      "influencers": "Инфлюенсеры",
      "reports": "Отчеты",
      "settings": "Настройки",
      "profile": "Профиль",
      
      // Project workflow
      "scenario": "Сценарий",
      "material": "Материал",
      "publication": "Публикация",
      
      // Project statuses
      "draft": "Черновик",
      "active": "Активный",
      "completed": "Завершено",
      "pending": "Ожидание",
      "in_review": "На проверке",
      "approved": "Утверждено",
      "rejected": "Отклонено",
      "published": "Опубликовано",
      "verified": "Проверено",
      
      // Dashboard
      "overview": "Обзор текущих кампаний и статистика",
      "active_projects": "Активные проекты",
      "pending_reviews": "Ожидает проверки",
      "completed_this_month": "Завершено в этом месяце",
      "new_influencers": "Новые инфлюенсеры",
      "recent_activities": "Последние активности",
      "all_activities": "Все активности",
      "requires_attention": "Требуют внимания",
      "needs_action": "Требуется действие",
      "deadline": "Дедлайн",
      "completed_on": "Завершено",
      "earned_this_month": "Заработано в этом месяце",
      
      // Projects
      "new_project": "Новый проект",
      "project_title": "Название проекта",
      "project_description": "Описание проекта",
      "client": "Клиент",
      "erid": "ERID",
      "budget": "Бюджет",
      "platforms": "Платформы",
      "start_date": "Дата начала",
      "deadline_date": "Дедлайн",
      "technical_links": "Технические ссылки",
      "key_requirements": "Ключевые требования",
      "manager": "Менеджер",
      "no_projects": "Проектов не найдено",
      "search_projects": "Поиск проектов...",
      "all_statuses": "Все статусы",
      "all_platforms": "Все платформы",
      "launch_project": "Запустить проект",
      
      // Influencers
      "no_influencers": "Инфлюенсеров не найдено",
      "search_influencers": "Поиск инфлюенсеров...",
      "add_influencer": "Добавить инфлюенсера",
      "nickname": "Никнейм",
      "followers": "Подписчики",
      
      // Social platforms
      "instagram": "Instagram",
      "tiktok": "TikTok",
      "youtube": "YouTube",
      "telegram": "Telegram",
      "vk": "ВКонтакте",
      
      // Comments & Activities
      "comments": "Комментарии",
      "add_comment": "Добавить комментарий",
      "write_comment": "Написать комментарий...",
      "attach": "Прикрепить",
      "last_updated": "Последнее обновление",
      "timeline": "Таймлайн",
      "information": "Информация",
      
      // Activities
      "scenario_approved": "Сценарий утвержден",
      "scenario_rejected": "Сценарий отклонен",
      "scenario_updated": "Сценарий обновлен",
      "material_submitted": "Материал отправлен",
      "material_approved": "Материал утвержден",
      "material_rejected": "Материал отклонен",
      "publication_published": "Публикация размещена",
      "publication_verified": "Публикация проверена",
      "project_created": "Проект создан",
      "project_updated": "Проект обновлен",
      "project_completed": "Проект завершен",
      
      // Errors
      "error": "Ошибка",
      "not_found": "Не найдено",
      "server_error": "Ошибка сервера",
      "try_again": "Попробуйте снова"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
