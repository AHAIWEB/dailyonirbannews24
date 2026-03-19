// Auto-calculating Bengali, English, and Hijri dates

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const banglaMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
const banglaSeasons = ['গ্রীষ্মকাল', 'গ্রীষ্মকাল', 'বর্ষাকাল', 'বর্ষাকাল', 'শরৎকাল', 'শরৎকাল', 'হেমন্তকাল', 'হেমন্তকাল', 'শীতকাল', 'শীতকাল', 'বসন্তকাল', 'বসন্তকাল'];
const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const engMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const hijriMonths = ['মহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'];

function toBanglaNum(n: number): string {
  return String(n).split('').map(d => banglaDigits[parseInt(d)]).join('');
}

// Bangla calendar calculation (approximate)
function getBanglaDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();

  // Bangla calendar starts from April 14 (approximately)
  // Month lengths: বৈশাখ(31), জ্যৈষ্ঠ(31), আষাঢ়(31), শ্রাবণ(31), ভাদ্র(31), আশ্বিন(30), কার্তিক(30), অগ্রহায়ণ(30), পৌষ(30), মাঘ(30), ফাল্গুন(30), চৈত্র(30)
  const banglaMonthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  
  // English month start dates for Bangla months (approximate)
  // বৈশাখ starts April 14, জ্যৈষ্ঠ starts May 15, etc.
  const banglaStartDates = [
    { month: 3, day: 14 },  // বৈশাখ: Apr 14
    { month: 4, day: 15 },  // জ্যৈষ্ঠ: May 15
    { month: 5, day: 15 },  // আষাঢ়: Jun 15
    { month: 6, day: 16 },  // শ্রাবণ: Jul 16
    { month: 7, day: 16 },  // ভাদ্র: Aug 16
    { month: 8, day: 16 },  // আশ্বিন: Sep 16
    { month: 9, day: 16 },  // কার্তিক: Oct 16
    { month: 10, day: 15 }, // অগ্রহায়ণ: Nov 15
    { month: 11, day: 15 }, // পৌষ: Dec 15
    { month: 0, day: 14 },  // মাঘ: Jan 14
    { month: 1, day: 13 },  // ফাল্গুন: Feb 13
    { month: 2, day: 15 },  // চৈত্র: Mar 15
  ];

  let banglaMonth = 0;
  let banglaDay = 1;
  let banglaYear = year - 593;

  for (let i = 0; i < 12; i++) {
    const start = banglaStartDates[i];
    const nextIdx = (i + 1) % 12;
    const next = banglaStartDates[nextIdx];

    let startDate = new Date(year, start.month, start.day);
    let nextDate: Date;

    if (nextIdx === 0 || next.month < start.month) {
      nextDate = new Date(year + 1, next.month, next.day);
    } else {
      nextDate = new Date(year, next.month, next.day);
    }

    if (date >= startDate && date < nextDate) {
      banglaMonth = i;
      banglaDay = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (month < 3 || (month === 3 && day < 14)) {
        banglaYear = year - 594;
      }
      break;
    }
  }

  // Handle Jan-Mar edge case
  if (month < 3 || (month === 3 && day < 14)) {
    for (let i = 9; i < 12; i++) {
      const start = banglaStartDates[i];
      const nextIdx = (i + 1) % 12;
      const next = banglaStartDates[nextIdx];

      let startDate = new Date(year - (i >= 9 ? 0 : 0), start.month, start.day);
      if (i === 9) startDate = new Date(year, start.month, start.day);
      
      let nextDate: Date;
      if (nextIdx <= i || next.month < start.month) {
        nextDate = new Date(year, next.month, next.day);
      } else {
        nextDate = new Date(year, next.month, next.day);
      }

      if (date >= startDate && date < nextDate) {
        banglaMonth = i;
        banglaDay = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        banglaYear = year - 594;
        break;
      }
    }
  }

  return {
    day: toBanglaNum(banglaDay),
    month: banglaMonths[banglaMonth],
    year: toBanglaNum(banglaYear),
    season: banglaSeasons[banglaMonth],
  };
}

// Approximate Hijri date calculation
function getHijriDate(date: Date) {
  // Using a known reference point: 1 Jan 2026 = ~1 Rajab 1447
  // More accurate: use astronomical calculation
  const epoch = new Date(622, 6, 19).getTime(); // Hijri epoch (approximate)
  const msPerDay = 86400000;
  const daysSinceEpoch = Math.floor((date.getTime() - epoch) / msPerDay);
  
  // Hijri year is approximately 354.36667 days
  const hijriCycle = 30; // 30-year cycle
  const daysInCycle = 10631; // days in 30 Hijri years
  
  const cycles = Math.floor(daysSinceEpoch / daysInCycle);
  let remainingDays = daysSinceEpoch % daysInCycle;
  
  // Leap years in 30-year cycle: 2,5,7,10,13,16,18,21,24,26,29
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  let yearInCycle = 0;
  
  for (let y = 1; y <= 30; y++) {
    const daysInYear = leapYears.includes(y) ? 355 : 354;
    if (remainingDays < daysInYear) {
      yearInCycle = y;
      break;
    }
    remainingDays -= daysInYear;
  }
  
  const hijriYear = cycles * 30 + yearInCycle;
  
  // Month lengths: odd months 30 days, even months 29 days (last month 30 in leap year)
  let hijriMonth = 0;
  let hijriDay = 1;
  
  for (let m = 0; m < 12; m++) {
    let daysInMonth: number;
    if (m % 2 === 0) daysInMonth = 30;
    else if (m === 11 && leapYears.includes(yearInCycle)) daysInMonth = 30;
    else daysInMonth = 29;
    
    if (remainingDays < daysInMonth) {
      hijriMonth = m;
      hijriDay = remainingDays + 1;
      break;
    }
    remainingDays -= daysInMonth;
  }

  return {
    day: toBanglaNum(hijriDay),
    month: hijriMonths[hijriMonth],
    year: toBanglaNum(hijriYear),
  };
}

export function getFormattedDates(date: Date = new Date()) {
  const dayName = banglaDays[date.getDay()];
  const engDay = toBanglaNum(date.getDate());
  const engMonth = engMonths[date.getMonth()];
  const engYear = toBanglaNum(date.getFullYear());
  
  const bangla = getBanglaDate(date);
  const hijri = getHijriDate(date);

  return {
    dayName,
    english: `${engDay} ${engMonth} ${engYear} ইংরেজি`,
    bangla: `${bangla.day} ${bangla.month}, ${bangla.year}, ${bangla.season}`,
    hijri: `${hijri.day} ${hijri.month} ${hijri.year} হিজরি`,
  };
}
