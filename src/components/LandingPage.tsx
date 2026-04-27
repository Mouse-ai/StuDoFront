import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Bell, ShieldCheck, Calendar, MessageSquare,
  ArrowRight, CheckCircle, Sparkles, Smartphone, Clock, Layers,
  ListChecks, BarChart3
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleNavigate = () => {
    if (isAuthenticated) {
      navigate('/student/tasks');
    } else {
      navigate('/?showAuth=register');
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-12 sm:pb-16 px-3 sm:px-4 max-w-6xl mx-auto">
      {/* HERO */}
      <section className="text-center mb-12 sm:mb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.15] sm:leading-tight">
          Управляй дедлайнами.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Делегируй рутину ИИ.</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed px-2">
          StuDo — это не просто список задач. Это персональный учебный кабинет, где каждая задача помнит контекст,
          прогресс считается автоматически, а напоминания приходят прямо в Telegram.
        </p>
        <button
          onClick={handleNavigate}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 transition transform hover:scale-105 text-sm sm:text-base"
        >
          Начать бесплатно <ArrowRight size={18} />
        </button>
      </section>

      {/* КАК РАБОТАЕТ */}
      <section className="mb-12 sm:mb-20">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 px-2">Как работает StuDo?</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            { step: '01', title: 'Создайте задачу', desc: 'Укажите предмет, дедлайн и приоритет. Система автоматически добавит её в календарь и расставит по важности.' },
            { step: '02', title: 'Получите план от AI', desc: 'Встроенный ассистент разберёт тему, предложит структуру ответа, найдет формулы и поможет составить чек-лист.' },
            { step: '03', title: 'Отслеживайте и сдавайте', desc: 'Прогресс обновляется в реальном времени. Если дедлайн близко — придёт мягкое напоминание в Telegram.' }
          ].map((item, i) => (
            <div key={i} className="relative p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden">
              <span className="absolute -top-2 -left-3 sm:-top-4 sm:-left-2 text-5xl sm:text-6xl md:text-7xl font-black text-indigo-50/60 group-hover:text-indigo-100/60 transition select-none leading-none">
                {item.step}
              </span>
              <div className="relative z-10 mt-4 sm:mt-0">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 pr-2">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ПОЧЕМУ ВЫБИРАЮТ */}
      <section className="mb-12 sm:mb-20 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 px-2">Почему студенты выбирают StuDo?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {[
            { icon: <Bot size={22} />, title: 'Контекстный AI', desc: 'Каждая задача хранит отдельную историю чата. Ассистент помнит ваши формулы, заметки и стиль общения.' },
            { icon: <Bell size={22} />, title: 'Telegram-уведомления', desc: 'Привяжите @username и получайте мягкие напоминания за 24ч и 2ч до дедлайна. Никакого спама.' },
            { icon: <Calendar size={22} />, title: 'Умные дедлайны', desc: 'Система подсвечивает просроченные задачи, предлагает перенести загрузку и автоматически сортирует список по срочности.' },
            { icon: <BarChart3 size={22} />, title: 'Прогресс по предметам', desc: 'Визуальная шкала успеваемости. Закрытие задач автоматически повышает процент готовности к экзамену.' },
            { icon: <ShieldCheck size={22} />, title: 'Приватность и контроль', desc: 'JWT-аутентификация, шифрование сессий. Вы решаете, какие данные хранить, а какие очищать.' },
            { icon: <Smartphone size={22} />, title: 'Работает везде', desc: 'Адаптивный интерфейс, поддержка свайпов, быстрый запуск. Учитесь с телефона, планшета или ноутбука.' }
          ].map((f, i) => (
            <div key={i} className="p-4 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">{f.icon}</div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ДЕТАЛИ */}
      <section className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 mb-12 sm:mb-20">
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-amber-500 shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold">AI, который учится вместе с вами</h3>
          </div>
          <ul className="space-y-2.5 sm:space-y-3">
            {[
              'Изолированная память: чат не смешивается между задачами',
              'Поддержка Markdown: формулы, списки, код, цитаты',
              'Генерация чек-листов по темам и методичкам',
              'Режим "Объясни как 5-летнему" для сложных тем'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-blue-500 shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold">Интеграция с Telegram</h3>
          </div>
          <ul className="space-y-2.5 sm:space-y-3">
            {['Введите @username в профиле — бот запомнит вас',
              'Уведомления приходят только когда они нужны',
              'Переключатель `notifications` в один клик',
              'Возможность отписаться или изменить частоту'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <CheckCircle size={16} className="text-blue-500 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-14 text-white">
        <Clock size={32} className="mx-auto mb-4 text-indigo-200" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 px-2">Хватит терять баллы из-за забытых дедлайнов</h2>
        <p className="text-indigo-200 max-w-2xl mx-auto mb-6 sm:mb-8 text-base sm:text-lg px-4">
          Перенесите все задачи в одно место. Пусть AI планирует, а вы — учитесь.
        </p>
        <button
          onClick={handleNavigate}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-900 hover:bg-gray-100 rounded-xl font-semibold transition shadow-xl text-sm sm:text-base"
        >
          Открыть личный кабинет <ArrowRight size={18} />
        </button>
        <p className="mt-4 text-xs text-indigo-300">Регистрация занимает 30 секунд. Данные защищены.</p>
      </section>
    </div>
  );
}
