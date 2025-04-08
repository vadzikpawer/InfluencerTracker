import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
      "send": "Отправить",
      "current": "Текущий",
      "not_set": "Не установлен",
      "per_week": "в неделю",
      "my_dashboard": "Моя панель",
      "campaign_management": "Управление кампаниями",
      "version_history": "История версий",
      "proceed_to_materials": "Перейти к материалам",
      "aleksey_smirnov": "Алексей Смирнов",
      
      // Auth
      "login": "Вход",
      "login_description": "Войдите в свой аккаунт для доступа к платформе",
      "login_failed": "Ошибка входа",
      "logging_in": "Вход...",
      "logout": "Выход",
      "username": "Имя пользователя",
      "password": "Пароль",
      "sign_in": "Войти",
      "enter_username": "Введите имя пользователя",
      "enter_password": "Введите пароль",
      "unauthorized": "Не авторизован",
      "invalid_credentials": "Неверные учетные данные",
      "demo_credentials": "Демо учетные данные",
      "manager": "Менеджер",
      "influencer": "Инфлюенсер",
      
      // Navigation
      "dashboard": "Дашборд",
      "projects": "Проекты",
      "project_management": "Управление проектами",
      "influencers": "Инфлюенсеры",
      "manage_influencers": "Управление инфлюенсерами",
      "reports": "Отчеты",
      "settings": "Настройки",
      "profile": "Профиль",
      "all_projects": "Все проекты",
      "back_to_projects": "Вернуться к проектам",
      
      // Project workflow
      "scenario": "Сценарий",
      "material": "Материал",
      "publication": "Публикация",
      "scenario_phase": "Фаза сценария",
      "material_phase": "Фаза материала",
      "publication_phase": "Фаза публикации",
      "scenario_needs_review": "Сценарий требует проверки",
      "material_needs_review": "Материал требует проверки",
      "check_scenario_feedback": "Проверить отзыв о сценарии",
      "upload_material": "Загрузить материал",
      "create_scenario": "Создать сценарий",
      "creating": "Создание...",
      "create": "Создать",
      "scenario_created": "Сценарий создан",
      "scenario_created_success": "Сценарий успешно создан",
      "scenario_description": "Добавьте сценарий для этого проекта, чтобы установить задачи и ожидания для инфлюенсеров.",
      "scenario_content": "Содержание сценария",
      "scenario_content_placeholder": "Опишите подробно сценарий для инфлюенсера...",
      "scenario_content_description": "Подробное описание сценария для инфлюенсера",
      "deadline": "Крайний срок",
      "deadline_description": "Укажите крайний срок для подготовки сценария",
      "select_date": "Выберите дату",
      "google_doc_url": "Ссылка на Google Doc",
      "google_doc_url_description": "Ссылка на детальный сценарий в Google Docs (опционально)",
      "google_doc": "Открыть в Google Docs",
      "approve_scenario": "Утвердить сценарий",
      "approving...": "Утверждение...",
      "new_scenario_content": "Новый сценарий для проекта",
      "view_materials": "Перейти к материалам",
      
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
      "added": "Добавлен",
      "under_approval": "На утверждении",
      
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
      "no_actions_required": "Действий не требуется",
      "no_urgent_projects": "Срочных проектов нет",
      "no_activities": "Нет активностей",
      "deadline": "Дедлайн",
      "completed_on": "Завершено",
      "earned_this_month": "Заработано в этом месяце",
      "new": "новых",
      "publications": "публикаций",
      
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
      "no_deadline": "Без дедлайна",
      "technical_links": "Технические ссылки",
      "key_requirements": "Ключевые требования",
      "no_projects": "Проектов не найдено",
      "create_first_project": "Создайте свой первый проект",
      "search_projects": "Поиск проектов...",
      "all_statuses": "Все статусы",
      "all_platforms": "Все платформы",
      "launch_project": "Запустить проект", 
      "project_not_found": "Проект не найден",
      "project_not_found_description": "Запрошенный проект не существует или был удален.",
      
      // Influencers
      "no_influencers": "Инфлюенсеров не найдено",
      "search_influencers": "Поиск инфлюенсеров...",
      "add_influencer": "Добавить инфлюенсера",
      "add_influencer_description": "Добавьте нового инфлюенсера в вашу базу",
      "add_first_influencer": "Добавьте своего первого инфлюенсера",
      "nickname": "Никнейм",
      "followers": "Подписчики",
      "bio": "Биография",
      "no_bio": "Нет биографии",
      "influencer_bio": "Биография инфлюенсера",
      "unknown_user": "Неизвестный пользователь",
      
      // Social platforms
      "instagram": "Instagram",
      "tiktok": "TikTok",
      "youtube": "YouTube",
      "telegram": "Telegram",
      "vk": "ВКонтакте",
      
      // Comments & Activities
      "comments": "Комментарии",
      "add_comment": "Добавить комментарий",
      "comment_added": "Комментарий добавлен",
      "comment_added_success": "Комментарий успешно добавлен",
      "comment_add_failed": "Не удалось добавить комментарий",
      "write_comment": "Написать комментарий...",
      "attach": "Прикрепить",
      "last_updated": "Последнее обновление",
      "timeline": "Таймлайн",
      "information": "Информация",
      "no_comments": "Нет комментариев",
      
      // Activities
      "scenario_approved": "Сценарий утвержден",
      "scenario_approval_success": "Сценарий успешно утвержден",
      "scenario_rejected": "Сценарий отклонен",
      "scenario_updated": "Сценарий обновлен",
      "scenario_create": "Создан новый сценарий",
      "scenario_deleted": "Сценарий удален",
      "scenario_deleted_success": "Сценарий успешно удален",
      "delete_scenario_error": "Ошибка при удалении сценария",
      "deleting...": "Удаление...",
      "scenario_to_material": "Сценарий утвержден, переход к материалам",
      "material_submitted": "Материал отправлен",
      "material_approved": "Материал утвержден",
      "material_rejected": "Материал отклонен",
      "publication_published": "Публикация размещена",
      "publication_verified": "Публикация проверена",
      "project_created": "Проект создан",
      "project_updated": "Проект обновлен",
      "project_completed": "Проект завершен",
      "workflow_to_scenario": "Переход на этап сценариев",
      "workflow_to_material": "Переход на этап материалов",
      "workflow_to_publication": "Переход на этап публикаций",
      "workflow_stage_changed": "Изменен этап проекта",
      
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
  .use(LanguageDetector)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
