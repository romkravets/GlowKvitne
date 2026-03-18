/**
 * Firebase Storage — утиліти для читання (фронтенд).
 *
 * Запис у Storage виконується виключно через backend (firebase-admin):
 *   - Фото аналізу → зберігаються автоматично після успішного processAnalysis
 *   - Virtual Try-On результати → POST /api/virtual-tryon/save
 *
 * Структура шляхів:
 *   users/{uid}/analyses/{analysisId}/face.jpg
 *   users/{uid}/analyses/{analysisId}/body.jpg
 *   users/{uid}/tryon/{timestamp}.jpg
 */

// Файл залишено для майбутніх read-операцій (перегляд збережених фото).
// Наразі весь запис — на боці сервера.
export {};
