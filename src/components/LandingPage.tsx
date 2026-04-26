import { useNavigate } from 'react-router-dom';
import { 
  Zap, Brain, Bell, ShieldCheck, Calendar, MessageSquare, 
  ArrowRight, CheckCircle, Sparkles, Smartphone, Clock, Layers 
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
      {/* 🎯 Hero */}
      <section className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
          <Zap size={14} /> Открытый бета-релиз v1.0
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Управляй дедлайнами.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Делегируй рутину ИИ.</span>
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg md:text-xl mb-10 leading-relaxed">
          StuDo — это не просто список задач. Это персональный учебный кабинет, где каждая задача помнит контекст, 
          прогресс считается автоматически, а напоминания приходят прямо в Telegram.
        </p>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 transition transform hover:scale-105"
        >
          Начать бесплатно <ArrowRight size={18} />
        </button>
      </section>

      {/* 🔄 Как это работает */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Как работает StuDo?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Создайте задачу', desc: 'Укажите предмет, дедлайн и приоритет. Система автоматически добавит её в календарь и расставит по важности.' },
            { step: '02', title: 'Получите план от AI', desc: 'Встроенный ассистент разберёт тему, предложит структуру ответа, найдет формулы и поможет составить чек-лист.' },
            { step: '03', title: 'Отслеживайте и сдавайте', desc: 'Прогресс обновляется в реальном времени. Если дедлайн близко — придёт мягкое напоминание в Telegram.' }
          ].map((item, i) => (
            <div key={i} className="relative p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
              <span className="absolute -top-4 -left-2 text-6xl font-black text-indigo-50/80 group-hover:text-indigo-100/60 transition">{item.step}</span>
              <h3 className="text-xl font-bold mb-3 relative z-10">{item.title}</h3>
              <p className="text-gray-600 relative z-10 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ⚡ Ключевые возможности */}
      <section className="mb-20 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Почему студенты выбирают StuDo?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Brain size={24}/>, title: 'Контекстный AI', desc: 'Каждая задача хранит отдельную историю чата. Нейросеть помнит ваши формулы, заметки и стиль общения.' },
            { icon: <Bell size={24}/>, title: 'Telegram-уведомления', desc: 'Привяжите @username и получайте мягкие напоминания за 24ч и 2ч до дедлайна. Никакого спама.' },
            { icon: <Calendar size={24}/>, title: 'Умные дедлайны', desc: 'Система подсвечивает просроченные задачи, предлагает перенести загрузку и автоматически сортирует список по срочности.' },
            { icon: <Layers size={24}/>, title: 'Прогресс по предметам', desc: 'Визуальная шкала успеваемости. Закрытие задач автоматически повышает процент готовности к экзамену.' },
            { icon: <ShieldCheck size={24}/>, title: 'Приватность и контроль', desc: 'JWT-аутентификация, шифрование сессий. Вы решаете, какие данные хранить, а какие очищать.' },
            { icon: <Smartphone size={24}/>, title: 'Работает везде', desc: 'Адаптивный интерфейс, поддержка свайпов, быстрый запуск. Учитесь с телефона, планшета или ноутбука.' }
          ].map((f, i) => (
            <div key={i} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🤖 Глубокое погружение в AI и Уведомления */}
      <section className="grid md:grid-cols-2 gap-10 mb-20">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-amber-500" />
            <h3 className="text-xl font-bold">AI, который учится вместе с вами</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Изолированная память: чат не смешивается между задачами',
              'Поддержка Markdown: формулы, списки, код, цитаты',
              'Генерация чек-листов по темам и методичкам',
              'Режим "Объясни как 5-летнему" для сложных тем'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-blue-500" />
            <h3 className="text-xl font-bold">Интеграция с Telegram</h3>
          </div>
          <ul className="space-y-3">
            {[              'Введите @username в профиле — бот запомнит вас',
              'Уведомления приходят только когда они нужны',
              'Переключатель `notifications` в один клик',
              'Возможность отписаться или изменить частоту'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={16} className="text-blue-500 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 🚀 Финальный CTA */}
      <section className="text-center bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-10 md:p-14 text-white">
        <Clock size={32} className="mx-auto mb-4 text-indigo-200" />
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Хватит терять баллы из-за забытых дедлайнов</h2>
        <p className="text-indigo-200 max-w-2xl mx-auto mb-8 text-lg">
          Перенесите все задачи в одно место. Пусть AI планирует, а вы — учитесь.
        </p>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 hover:bg-gray-100 rounded-xl font-semibold transition shadow-xl"
        >
          Открыть личный кабинет <ArrowRight size={18} />
        </button>
        <p className="mt-4 text-xs text-indigo-300">Регистрация занимает 30 секунд. Данные защищены.</p>
      </section>
    </div>
  );
}