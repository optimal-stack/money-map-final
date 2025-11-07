import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: {
    welcome: "Welcome",
    add: "Add",
    analytics: "Analytics",
    recentTransactions: "Recent Transactions",
    newTransaction: "New Transaction",
    expense: "Expense",
    income: "Income",
    amountPlaceholder: "0.00",
    transactionTitle: "Transaction Title",
    category: "Category",
    festivalOptional: "Festival (optional)",
    save: "Save",
    analyticsTitle: "Analytics",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netBalance: "Net Balance",
    spendingByCategory: "Spending by Category",
    topCategories: "Top Categories",
    spendingTrends: "Spending Trends",
    noData: "No data available for this period",
  }},
  hi: { translation: {
    welcome: "स्वागत है",
    add: "जोड़ें",
    analytics: "विश्लेषण",
    recentTransactions: "हाल के लेन-देन",
    newTransaction: "नया लेन-देन",
    expense: "खर्च",
    income: "आय",
    amountPlaceholder: "0.00",
    transactionTitle: "लेन-देन का शीर्षक",
    category: "श्रेणी",
    festivalOptional: "त्यौहार (वैकल्पिक)",
    save: "सेव",
    analyticsTitle: "विश्लेषण",
    totalIncome: "कुल आय",
    totalExpenses: "कुल खर्च",
    netBalance: "शुद्ध शेष",
    spendingByCategory: "श्रेणी अनुसार खर्च",
    topCategories: "शीर्ष श्रेणियाँ",
    spendingTrends: "खर्च रुझान",
    noData: "इस अवधि के लिए डेटा उपलब्ध नहीं",
  }},
  ta: { translation: {
    welcome: "வரவேற்பு",
    add: "சேர்க்க",
    analytics: "பகுப்பாய்வு",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    newTransaction: "புதிய பரிவர்த்தனை",
    expense: "செலவு",
    income: "வருமானம்",
    amountPlaceholder: "0.00",
    transactionTitle: "பரிவர்த்தனை தலைப்பு",
    category: "வகை",
    festivalOptional: "திருவிழா (ஐச்சிகம்)",
    save: "சேமிக்க",
    analyticsTitle: "பகுப்பாய்வு",
    totalIncome: "மொத்த வருமானம்",
    totalExpenses: "மொத்த செலவு",
    netBalance: "நிகர இருப்பு",
    spendingByCategory: "வகை வாரியாக செலவு",
    topCategories: "சிறந்த வகைகள்",
    spendingTrends: "செலவு போக்கு",
    noData: "இந்த காலத்திற்கு தரவு இல்லை",
  }},
  te: { translation: { welcome: "స్వాగతం", add: "జోడించు", analytics: "విశ్లేషణ", recentTransactions: "తాజా లావాదేవీలు", newTransaction: "క్రొత్త లావాదేవీ", expense: "ఖర్చు", income: "ఆదాయం", amountPlaceholder: "0.00", transactionTitle: "లావాదేవీ శీర్షిక", category: "వర్గం", festivalOptional: "పండుగ (ఐచ్చికం)", save: "సేవ్", analyticsTitle: "విశ్లేషణ", totalIncome: "మొత్తం ఆదాయం", totalExpenses: "మొత్తం ఖర్చు", netBalance: "నికర బ్యాలెన్స్", spendingByCategory: "వర్గం ప్రకారం ఖర్చు", topCategories: "టాప్ వర్గాలు", spendingTrends: "ఖర్చు ధోరణులు", noData: "ఈ కాలానికి డేటా లేదు" }},
  bn: { translation: { welcome: "স্বাগতম", add: "যোগ করুন", analytics: "বিশ্লেষণ", recentTransactions: "সাম্প্রতিক লেনদেন", newTransaction: "নতুন লেনদেন", expense: "খরচ", income: "আয়", amountPlaceholder: "0.00", transactionTitle: "লেনদেনের শিরোনাম", category: "বিভাগ", festivalOptional: "উৎসব (ঐচ্ছিক)", save: "সংরক্ষণ", analyticsTitle: "বিশ্লেষণ", totalIncome: "মোট আয়", totalExpenses: "মোট খরচ", netBalance: "নেট ব্যালেন্স", spendingByCategory: "বিভাগ অনুযায়ী খরচ", topCategories: "শীর্ষ বিভাগ", spendingTrends: "খরচের প্রবণতা", noData: "এই সময়ের জন্য কোন ডেটা নেই" }},
  mr: { translation: { welcome: "स्वागत आहे", add: "जोडा", analytics: "विश्लेषण", recentTransactions: "अलीकडील व्यवहार", newTransaction: "नवीन व्यवहार", expense: "खर्च", income: "उत्पन्न", amountPlaceholder: "0.00", transactionTitle: "व्यवहार शीर्षक", category: "श्रेणी", festivalOptional: "सण (ऐच्छिक)", save: "जतन करा", analyticsTitle: "विश्लेषण", totalIncome: "एकूण उत्पन्न", totalExpenses: "एकूण खर्च", netBalance: "निव्वळ शिल्लक", spendingByCategory: "श्रेणीवार खर्च", topCategories: "शीर्ष श्रेण्या", spendingTrends: "खर्चाची प्रवृत्ती", noData: "या कालावधीसाठी डेटा नाही" }},
  gu: { translation: { welcome: "સ્વાગત", add: "ઉમેરો", analytics: "વિશ્લેષણ", recentTransactions: "તાજા ટ્રાન્ઝેક્શન", newTransaction: "નવું ટ્રાન્ઝેક્શન", expense: "ખર્ચ", income: "આવક", amountPlaceholder: "0.00", transactionTitle: "ટ્રાન્ઝેક્શન શીર્ષક", category: "શ્રેણી", festivalOptional: "તહેવાર (વૈકલ્પિક)", save: "સેવ", analyticsTitle: "વિશ્લેષણ", totalIncome: "કુલ આવક", totalExpenses: "કુલ ખર્ચ", netBalance: "નેટ બેલેન્સ", spendingByCategory: "શ્રેણી મુજબ ખર્ચ", topCategories: "ટોચની શ્રેણીઓ", spendingTrends: "ખર્ચના ટ્રેન્ડ્સ", noData: "આ સમયગાળામાં ડેટા નથી" }},
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources,
    lng: Localization.getLocales()[0]?.languageCode || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;


