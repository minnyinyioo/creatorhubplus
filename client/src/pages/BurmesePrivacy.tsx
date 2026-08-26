/**
 * CreatorHubPlus — Myanmar Privacy Policy
 * Language direction: formal public-service Burmese with plain procedural clarity.
 */
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useSiteLocale } from "@/lib/useSiteLocale";

const sections = [
  { label: "၀၁", title: "ဤမူဝါဒတွင် အကျုံးဝင်သည့်အချက်များ", content: "ဤကိုယ်ရေးအချက်အလက် မူဝါဒသည် CreatorHubPlus ဝဘ်ဆိုက်သို့ ဝင်ရောက်အသုံးပြုခြင်း၊ ဆက်သွယ်ရေး သို့မဟုတ် အကူအညီတောင်းဆိုမှုလမ်းကြောင်းများကို အသုံးပြုခြင်းနှင့် စာရင်းအင်းဆိုင်ရာ Cookie များကို ရွေးချယ်ခြင်းတို့အတွင်း ကိုယ်ရေးအချက်အလက်များကို မည်သို့ကိုင်တွယ်သုံးစွဲသည်ကို ရှင်းလင်းဖော်ပြပါသည်။" },
  { label: "၀၂", title: "မိမိဆန္ဒအလျောက် ပေးအပ်သည့်အချက်အလက်", content: "CreatorHubPlus သို့ ဆက်သွယ်သည့်အခါ ပလက်ဖောင်း၊ အကောင့်အခြေအနေ၊ ငွေလက်ခံလမ်းကြောင်း သို့မဟုတ် အကူအညီလိုအပ်ချက်နှင့် စပ်လျဉ်းသည့်အချက်များကို ပေးအပ်နိုင်ပါသည်။ စကားဝှက်၊ ငွေပေးချေကတ်အချက်အလက် သို့မဟုတ် အလွန်အမင်းအရေးကြီးသောအချက်အလက်များကို အများသုံးဆက်သွယ်ရေးလမ်းကြောင်းများမှ မပေးပို့ရန် မေတ္တာရပ်ခံအပ်ပါသည်။" },
  { label: "၀၃", title: "Cookie များနှင့် စာရင်းအင်းဆိုင်ရာ အသုံးပြုမှု", content: "မရှိမဖြစ်လိုအပ်သော Cookie များသည် ဝဘ်ဆိုက်၏ အခြေခံလုပ်ဆောင်ချက်များနှင့် မိမိရွေးချယ်ထားသော ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ ဆက်တင်များကို ထိန်းသိမ်းရန် အသုံးပြုပါသည်။ စာရင်းအင်းဆိုင်ရာ Cookie များသည် ရွေးချယ်အသုံးပြုနိုင်သောအရာဖြစ်ပြီး Cookie ဆက်တင်များတွင် ခွင့်ပြုမှသာ စတင်အသုံးပြုပါမည်။" },
  { label: "၀၄", title: "အချက်အလက်များ အသုံးပြုသည့်ရည်ရွယ်ချက်", content: "ပေးအပ်ထားသောအချက်အလက်များကို အကူအညီတောင်းဆိုမှုများအား တုံ့ပြန်ဆောင်ရွက်ရန်၊ ဝဘ်ဆိုက်ကို ထိန်းသိမ်းရန်၊ အသုံးပြုသူအတွေ့အကြုံကို ပိုမိုရှင်းလင်းစေရန်နှင့် ဝန်ဆောင်မှုကို မမှန်ကန်စွာအသုံးပြုခြင်းမှ ကာကွယ်ရန်အတွက်သာ အသုံးပြုပါသည်။ CreatorHubPlus သည် ကိုယ်ရေးအချက်အလက်များကို ရောင်းချခြင်း မပြုပါ။" },
  { label: "၀၅", title: "မိမိ၏ရွေးချယ်ခွင့်များ", content: "ဝဘ်ဆိုက်အောက်ခြေရှိ Cookie ဆက်တင်များမှ စာရင်းအင်းဆိုင်ရာခွင့်ပြုချက်ကို အချိန်မရွေး ပြန်လည်ပြင်ဆင်နိုင်ပါသည်။ Browser ၏ ဆက်တင်များကိုလည်း Cookie ထိန်းချုပ်ရန် အသုံးပြုနိုင်ပါသည်။ ဤမူဝါဒ သို့မဟုတ် အကူအညီတောင်းဆိုမှုဆိုင်ရာ အချက်အလက်များနှင့် ပတ်သက်၍ မေးမြန်းလိုပါက ဝဘ်ဆိုက်မှ ဖော်ပြထားသော ဆက်သွယ်ရေးလမ်းကြောင်းကို အသုံးပြုနိုင်ပါသည်။" },
];

export default function BurmesePrivacy() {
  useSiteLocale("my", "CreatorHubPlus — ကိုယ်ရေးအချက်အလက် မူဝါဒ");
  return <main className="privacy-page my-site">
    <header className="privacy-header"><Link href="/my" className="privacy-brand"><img src="/favicon.svg" alt="CreatorHubPlus" /><span>creatorhub<span>plus</span></span></Link><div className="locale-links"><Link href="/privacy">English</Link><Link href="/my" className="privacy-return"><ArrowLeft size={15} /> ဝဘ်ဆိုက်သို့ ပြန်သွားရန်</Link></div></header>
    <section className="privacy-hero"><div><p className="privacy-eyebrow"><ShieldCheck size={14} /> ကိုယ်ရေးအချက်အလက် မူဝါဒ</p><h1>ရွေးချယ်မှု<br /><em>ရှင်းလင်းစွာ</em></h1></div><p>ဤစာမျက်နှာတွင် CreatorHubPlus က မည်သည့်အချက်အလက်များကို အသုံးပြုသည်၊ မည်သည့်ရည်ရွယ်ချက်အတွက် အသုံးပြုသည်နှင့် မိမိ၏ ကိုယ်ရေးအချက်အလက်ဆိုင်ရာရွေးချယ်မှုများကို မည်သို့စီမံနိုင်သည်ကို ဖော်ပြထားပါသည်။</p></section>
    <section className="privacy-content"><aside className="privacy-aside"><p>နောက်ဆုံးပြင်ဆင်သည့်နေ့</p><strong>၂၀၂၆ ခုနှစ်၊ ဩဂုတ်လ ၂၅ ရက်</strong><span>CreatorHubPlus</span><button onClick={() => window.CookieConsent?.showPreferences?.()}>Cookie ဆက်တင်များ စီမံရန် <ArrowUpRight size={14} /></button></aside><div className="privacy-sections">{sections.map((section) => <article key={section.label}><span>{section.label}</span><div><h2>{section.title}</h2><p>{section.content}</p></div></article>)}</div></section>
    <footer className="privacy-footer"><p>CreatorHubPlus ကိုယ်ရေးအချက်အလက် မူဝါဒ</p><span><Link href="/my/terms">ဝန်ဆောင်မှု စည်းကမ်းများ <ArrowUpRight size={14} /></Link> <Link href="/my">CreatorHubPlus သို့ ပြန်သွားရန် <ArrowUpRight size={14} /></Link></span></footer>
  </main>;
}
