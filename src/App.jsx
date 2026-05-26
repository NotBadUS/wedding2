import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CREAM = "#f4efe6";
const BURGUNDY = "#64001b";
const TELEGRAM_BOT_TOKEN = "8611552832:AAF-tHBJZNW07GitC9KLfhsWGZa1h7GsCNs";
const TELEGRAM_CHAT_ID = "276030097";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const palette = ["#220909", "#4b1f2c", "#7d001c", "#9e243f", "#efe4d9", "#c4c4c4"];

const dayPlan = [
  { time: "15:30", label: "сбор гостей", side: "left" },
  { time: "16:00", label: "банкет", side: "right" },
];

function PlanItem({ time, label, align }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="font-script text-[2.1rem] leading-none">{time}</p>
      <p className="font-hand mt-0.5 text-[1.05rem] leading-tight">{label}</p>
    </div>
  );
}

function TransparentImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <p className="font-hand text-center text-lg text-[#64001b]/60">
        загрузите {alt}
      </p>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}

function FormOptionGroup({ legend, name, options }) {
  return (
    <fieldset className="text-left">
      <legend className="mb-2 block text-[1.35rem] leading-snug">{legend}</legend>
      <div className="flex flex-col gap-2.5 text-[1.1rem]">
        {options.map((opt) => (
          <label key={opt.value} className="form-option">
            <input type="radio" name={name} value={opt.value} required />
            <span className="form-option-box" aria-hidden="true" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function calculateTimeLeft(target) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function buildJuly2026Cells() {
  const offset = 3; // 1 июля 2026 — среда

  const cells = [];

  for (let i = 0; i < offset; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= 31; d++) {
    cells.push(d);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function Tape({ className = "" }) {
  return <div className={`tape ${className}`} aria-hidden="true" />;
}

function TapedCard({ children, className = "", tapes = "top" }) {
  return (
    <div className={`relative bg-white shadow-[0_12px_40px_rgba(34,9,9,0.12)] ${className}`}>
      {(tapes === "top" || tapes === "both") && (
        <>
          <Tape className="-top-2 left-[18%] -rotate-6" />
          <Tape className="-top-2 right-[18%] rotate-5" />
        </>
      )}
      {(tapes === "bottom" || tapes === "both") && (
        <Tape className="-bottom-2 left-[22%] rotate-4" />
      )}
      {children}
    </div>
  );
}

function StickerImage({ src, alt, fallbackLabel, rotate = "0deg", className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`sticker-photo flex aspect-[3/4] items-center justify-center bg-[#e8dfd3] font-hand text-lg text-[#64001b]/70 ${className}`}
        style={{ transform: `rotate(${rotate})` }}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`sticker-photo aspect-[3/4] w-full object-cover ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    />
  );
}

function Section({ children, className = "", style }) {
  return (
    <section className={`px-5 py-16 ${className}`} style={style}>
      <div className="mx-auto max-w-md">{children}</div>
    </section>
  );
}

export default function App() {
  const weddingDate = new Date("2026-07-24T16:00:00");
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(weddingDate)
  );
  const [sending, setSending] = useState(false);
  const calendarCells = buildJuly2026Cells();

  const handleFormSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const firstName = formData.get("firstName")?.toString().trim() ?? "";
  const lastName = formData.get("lastName")?.toString().trim() ?? "";

  const data = {
    fullname: `${firstName} ${lastName}`.trim(),
    attendance: formData.get("attendance"),
    drinks: formData.get("drinks") || "—",
    favoriteSong: formData.get("favoriteSong") || "—",
  };

  const message = `
💍 Новая анкета

👤 Гость: ${data.fullname}

✅ Присутствие: ${data.attendance}

🍷 Напитки:
${data.drinks}

🎵 Песня:
${data.favoriteSong}
  `;

  setSending(true);

  try {
    const response = await fetch("/api/sendTelegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Ошибка отправки");
    }

    alert("Анкета отправлена ❤️");
    e.target.reset();
  } catch (error) {
    console.error(error);
    alert("Ошибка отправки");
  } finally {
    setSending(false);
  }
};

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-md overflow-x-hidden" style={{ background: CREAM }}>
      {/* ——— HERO ——— */}
      <Section className="relative min-h-0 pb-6 pt-6">
        <svg
          viewBox="0 0 500 160"
          className="pointer-events-none absolute left-0 top-0 w-full"
          aria-hidden="true"
        >
          <path
            d="M0 75 C110 155 270 -10 500 85"
            stroke={BURGUNDY}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M248 95c-14-14-34 1-14 14l14 14 14-14c19-13-1-28-14-14z"
            fill={BURGUNDY}
            className="heart-pulse"
          />
        </svg>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 pt-24 text-center"
        >
          <p className="font-script text-[1.65rem] leading-none text-[#64001b] rotate-[-2deg]">
            наконец-то
          </p>
          <h1 className="font-title mt-1 text-[2.65rem] font-light uppercase leading-[0.95] tracking-[0.12em] text-[#64001b]">
            Мы женимся
          </h1>

          <div className="mt-8 flex justify-between gap-2 px-1 font-hand text-[1.05rem] leading-snug text-[#64001b]">
            <p className="max-w-[9.5rem] rotate-[-4deg] text-left">
              — интересно, кто будет моим мужем, когда я вырасту?
            </p>
            <p className="rotate-[4deg] text-right">— им буду я!</p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 px-1">
            <StickerImage
              src="/photos/kid-girl.png"
              alt="Фото невесты в детстве"
              fallbackLabel="фото невесты"
              rotate="-3deg"
            />
            <StickerImage
              src="/photos/kid-boy.png"
              alt="Фото жениха в детстве"
              fallbackLabel="фото жениха"
              rotate="2deg"
            />
          </div>
        </motion.div>
      </Section>

      <div
        className="flex w-full justify-between px-5 py-2 font-hand text-[0.95rem] tracking-wide text-white"
        style={{ background: BURGUNDY }}
        aria-hidden="true"
      >
        {["вы приглашены", "вы приглашены", "вы приглашены"].map((t, i) => (
          <span
            key={t + i}
            className={i === 0 ? "-rotate-3" : i === 1 ? "rotate-2" : "-rotate-2"}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ——— ДАТА + КАЛЕНДАРЬ ——— */}
      <Section className="border-b border-[#64001b]/10 pb-28 pt-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-hand text-[1.35rem] leading-8 text-[#64001b]">
            Дорогие друзья и близкие,
            <br />
            мы приглашаем вас разделить
            <br />
            с нами наше свадебное торжество,
            <br />
            которое состоится
          </p>

          <TapedCard className="mx-auto mt-10 max-w-[17.5rem] px-5 pb-6 pt-8 text-[#64001b]">
            <p className="font-script text-center text-[2.4rem] leading-none rotate-[-2deg]">
              24.07.2026
            </p>
            <h2 className="font-script mt-5 text-center text-[2.2rem] leading-none rotate-[-1deg]">
              июль
            </h2>

            <div className="mt-6 grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((day) => (
                <div key={day} className="font-script text-[0.95rem] lowercase">
                  {day}
                </div>
              ))}
              {calendarCells.map((day, idx) => (
                <div
                  key={`cell-${idx}`}
                  className="flex aspect-square items-center justify-center"
                >
                  {day ? (
                    <span
                      className={`font-title text-[1.05rem] ${
                        day === 24
                          ? "flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#64001b]"
                          : ""
                      }`}
                    >
                      {day}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <p className="font-script mt-5 text-right text-sm rotate-[5deg]">
              сохраните дату
            </p>
          </TapedCard>
        </motion.div>
      </Section>

      {/* ——— ЛОКАЦИЯ ——— */}
      <Section style={{ background: BURGUNDY }} className="py-20 text-white">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-script text-[2.8rem] rotate-[-2deg]">Локация</h2>
          <TapedCard className="mt-8 overflow-hidden p-2 rotate-[-1deg]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=43.762317%2C56.180337&z=16&pt=43.762317%2C56.180337,pm2rdm"
              width="100%"
              height="280"
              frameBorder="0"
              loading="lazy"
              title="Место проведения"
              className="block"
            />
          </TapedCard>
          <p className="font-hand mt-8 text-[1.2rem] leading-8">
            Шатер "Судак"
            <br />
            Нижегородская область, Богородский муниципальный округ, сельский поселок Окский, Береговая улица, 1
          </p>
        </motion.div>
      </Section>

      {/* ——— ПЛАН ДНЯ ——— */}
      <Section className="border-b border-[#64001b]/10 py-16">
        
<div className="relative">
  
  {/* фото справа сверху */}
  <img
    src="/photos/plan-top.jpg"
    alt="plan top"
    className="absolute right-0 -top-10 w-24 rotate-6 rounded-md shadow-lg"
  />

  {/* фото слева снизу */}
  <img
    src="/photos/plan-bottom.jpg"
    alt="plan bottom"
    className="absolute left-0 -bottom-10 w-24 -rotate-6 rounded-md shadow-lg"
  />

  {/* твой существующий контент */}
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="mx-auto w-full max-w-[26rem] text-[#64001b]"
  >

          <p className="font-script text-[1.2rem] leading-tight -rotate-6">
            План нашего дня
          </p>

          <div className="relative mt-10">
            <svg
              viewBox="0 0 80 520"
              className="pointer-events-none absolute left-1/2 top-2 bottom-2 z-0 h-[calc(100%-0.5rem)] w-10 -translate-x-1/2"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 40 0
                   C 68 65, 12 130, 40 195
                   C 68 260, 12 325, 40 390
                   C 68 455, 12 520, 40 520"
                stroke={BURGUNDY}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="relative z-10 flex flex-col">
              {dayPlan.map((item) => (
                <div
                  key={item.time}
                  className="flex min-h-[7rem] items-center"
                >
                  <div className="w-[42%] pr-6">
                    {item.side === "left" && (
                      <PlanItem
                        time={item.time}
                        label={item.label}
                        align="right"
                      />
                    )}
                  </div>
                  <div className="w-[16%]" aria-hidden="true" />
                  <div className="w-[42%] pl-6">
                    {item.side === "right" && (
                      <PlanItem
                        time={item.time}
                        label={item.label}
                        align="left"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
</div>
      </Section>

      {/* ——— ДРЕСС-КОД ——— */}
      <Section style={{ background: BURGUNDY }} className="py-20 text-white">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-script text-[2.8rem] rotate-[-2deg]">Дресс-Код</h2>

          <TapedCard className="mt-8 px-5 pb-6 pt-9 text-left text-[#64001b]">
            <p className="font-hand text-[1.15rem] leading-7">
              Мы стараемся сделать праздник красивым и стильным и будем рады,
              если вы поддержите цветовую гамму нашей свадьбы
            </p>
            <div className="mt-7 flex justify-center gap-2.5">
              {palette.map((color) => (
                <div
                  key={color}
                  className="h-12 w-12 rounded-full border border-[#64001b]/10"
                  style={{ background: color }}
                />
              ))}
            </div>
          </TapedCard>

        </motion.div>
      </Section>

      {/* ——— ПОЖЕЛАНИЯ ——— */}
      <Section className="pb-24 pt-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-script text-[2.8rem] text-[#64001b] rotate-[-2deg]">
            Пожелания
          </h2>
          <p className="font-hand mx-auto mt-8 max-w-[18rem] text-[1.2rem] leading-8 text-[#64001b]">
            Будем признательны за альтернативу букетам в виде бутылочки вина
            или вашего любимого напитка
          </p>

          <div className="relative mx-auto mt-10 w-40">
            {/* БУТЫЛКА (НИЖНИЙ СЛОЙ) */}
  <TransparentImage
    src="/photos/wine.png"
    alt="бутылку вина"
    className="relative z-10 mx-auto h-52 w-full rotate-[8deg]"
  />

  {/* СКОТЧ (ВЕРХНИЙ СЛОЙ) */}
  <div className="absolute left-1/3 top-8 z-20 -translate-x-1/2 rotate-[-8deg]">
    <Tape />
  </div>

  {/* ПОДПИСЬ */}
  <p className="font-script absolute -bottom-1 right-0 z-10 text-sm rotate-[6deg] text-[#64001b]">
    вместо цветов
  </p>

</div>
<p className="font-hand mt-10 text-[1.2rem] leading-7 text-[#64001b] text-center">
  В этот вечер мы будем рады разделить с вами атмосферу взрослого праздника, поэтому просим оставить дома самых маленьких. Спасибо за понимание! ❤️
</p>
        </motion.div>
      </Section>

      {/* ——— АНКЕТА ——— */}
      <Section className="pb-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="font-script text-center text-[2.5rem] text-[#64001b] rotate-[-2deg]">
            Анкета для гостей
          </h2>

          <TapedCard className="mt-8 px-5 pb-7 pt-9" tapes="both">
            <form
              onSubmit={handleFormSubmit}
              className="space-y-5 font-hand text-[1.1rem] text-[#64001b]"
            >
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-left">
                  <span className="mb-1 block text-[1.35rem] leading-snug">Имя</span>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full rounded-md border border-[#64001b]/25 bg-[#faf6f0] px-3 py-2.5 text-[1.1rem] outline-none focus:border-[#64001b]"
                  />
                </label>
                <label className="block text-left">
                  <span className="mb-1 block text-[1.35rem] leading-snug">Фамилия</span>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full rounded-md border border-[#64001b]/25 bg-[#faf6f0] px-3 py-2.5 text-[1.1rem] outline-none focus:border-[#64001b]"
                  />
                </label>
              </div>

              <FormOptionGroup
                legend="Сможете ли вы присутствовать?"
                name="attendance"
                options={[
                  { value: "Да", label: "Да" },
                  { value: "Нет", label: "Нет" },
                ]}
              />

              <label className="block text-left">
                <span className="mb-1 block text-[1.35rem] leading-snug">
                  Предпочтение по напиткам
                </span>
                <input
                  type="text"
                  name="drinks"
                  placeholder="Например: красное вино, виски, безалкогольное"
                  className="w-full rounded-md border border-[#64001b]/25 bg-[#faf6f0] px-3 py-2.5 text-[1.1rem] outline-none focus:border-[#64001b]"
                />
              </label>

              <label className="block text-left">
                <span className="mb-1 block text-[1.35rem] leading-snug">
                  Ваша любимая песня
                </span>
                <input
                  type="text"
                  name="favoriteSong"
                  placeholder="Исполнитель — название"
                  className="w-full rounded-md border border-[#64001b]/25 bg-[#faf6f0] px-3 py-2.5 text-[1.1rem] outline-none focus:border-[#64001b]"
                />
              </label>

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-md py-3 font-script text-2xl text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: BURGUNDY }}
              >
                {sending ? "Отправка..." : "Отправить"}
              </button>
            </form>
          </TapedCard>
        </motion.div>
      </Section>

      {/* ——— ФИНАЛ: таймер + подпись ——— */}
      <Section style={{ background: BURGUNDY }} className="py-16 text-white">
        <div className="text-center">
          <h2 className="font-script text-[2.4rem] rotate-[-2deg]">До свадьбы</h2>
          <p className="font-hand mt-2 text-[1.1rem] opacity-90">осталось</p>

          <div className="mt-8 grid grid-cols-4 gap-2">
            {[
              { label: "дней", value: timeLeft.days },
              { label: "часов", value: timeLeft.hours },
              { label: "минут", value: timeLeft.minutes },
              { label: "секунд", value: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="px-1 py-3"
                style={{ background: CREAM, color: BURGUNDY }}
              >
                <p className="font-script text-[1.75rem] leading-none tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1 font-hand text-[0.7rem] uppercase">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="font-script mt-12 text-[2rem] rotate-[-2deg]">
            С любовью, Даниил и Оксана
          </p>
        </div>
      </Section>
    </div>
  );
}
