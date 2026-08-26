/**
 * CreatorHubPlus — Myanmar Terms of Service
 * Baseline public terms; review with qualified local counsel before production reliance.
 */
import { ArrowLeft, ArrowUpRight, FileCheck2 } from "lucide-react";
import { Link } from "wouter";
import { useSiteLocale } from "@/lib/useSiteLocale";

const sections = [
  { label: "၀၁", title: "ဝန်ဆောင်မှုအကြောင်း", content: "CreatorHubPlus သည် ဖန်တီးရှင်ဝင်ငွေ၊ ငွေလက်ခံလမ်းကြောင်း၊ အကောင့်ပြင်ဆင်မှုနှင့် အတည်ပြုနိုင်သော လိပ်စာပြင်ဆင်မှုများအတွက် သတင်းအချက်အလက်နှင့် လုပ်ဆောင်ရမည့်အဆင့်များကို စနစ်တကျ ရှင်းလင်းပေးပါသည်။ မည်သည့်ပြင်ပပလက်ဖောင်းကိုမျှ ကျွန်ုပ်တို့ မထိန်းချုပ်ပါ။" },
  { label: "၀၂", title: "မှန်ကန်သော အချက်အလက်", content: "သင့်အခြေအနေကို မှန်ကန်စွာ ဖော်ပြပြီး တရားဝင်အသုံးပြုရန် သဘောတူပါသည်။ စကားဝှက်၊ စာရွက်စာတမ်းအတု၊ အခြားသူ၏ ကိုယ်ရေးအချက်အလက် သို့မဟုတ် ပလက်ဖောင်းစည်းမျဉ်းကို ရှောင်လွှဲရန် ရည်ရွယ်သည့် အကြောင်းအရာများကို မပေးပို့ပါနှင့်။" },
  { label: "၀၃", title: "ငွေပေးချေမှု တောင်းဆိုမှုနှင့် စစ်ဆေးမှု", content: "ရွေးချယ်ထားသော ဝန်ဆောင်မှုနှင့် ဆာဗာမှ သတ်မှတ်ထားသော ပမာဏအတိုင်း ငွေပေးချေမှု တောင်းဆိုမှုကို ဖန်တီးပါသည်။ ပေးပို့ထားသော ပြေစာများကို ခွင့်ပြုထားသော ဝန်ထမ်းများက စစ်ဆေးနိုင်ပါသည်။ ပြေစာပေးပို့ခြင်းသည် အတည်ပြုပြီးကြောင်း မဆိုလိုပါ၊ ပလက်ဖောင်းအတည်ပြုမှုကိုလည်း အာမမခံပါ။" },
  { label: "၀၄", title: "ပြင်ပပလက်ဖောင်းများ", content: "ပလက်ဖောင်းအမည်များ၊ ငွေပေးချေနည်းလမ်းများ၊ အမှတ်တံဆိပ်များနှင့် ဆုံးဖြတ်ချက်များသည် သက်ဆိုင်ရာပိုင်ရှင်များ၏ ပစ္စည်းများဖြစ်ပါသည်။ CreatorHubPlus သည် ထိုပြင်ပအဖွဲ့အစည်းများနှင့် ဆက်နွှယ်ခြင်း သို့မဟုတ် ထောက်ခံခြင်း မရှိပါ။" },
  { label: "၀၅", title: "ပြန်အမ်းငွေနှင့် ဆက်သွယ်ရန်", content: "ငွေပေးချေမှု၊ ပြေစာ၊ ထပ်မံရှင်းလင်းရန် တောင်းဆိုမှု သို့မဟုတ် ပြန်အမ်းငွေကိစ္စများအတွက် support လမ်းကြောင်းမှ ဆက်သွယ်ပြီး order number ကို ထည့်ပေးပါ။ ပြန်အမ်းငွေဆုံးဖြတ်ချက်သည် သက်ဆိုင်ရာဝန်ဆောင်မှုအစီအစဉ်နှင့် တောင်းဆိုမှုအချက်အလက်များပေါ် မူတည်ပါသည်။" },
  { label: "၀၆", title: "ပြောင်းလဲမှုနှင့် သင့်လျော်သောအသုံးပြုမှု", content: "ဝန်ဆောင်မှုကို တိုးတက်စေရန် သို့မဟုတ် အသုံးပြုသူများနှင့် ဝန်ဆောင်မှုကို ကာကွယ်ရန် ဤစည်းကမ်းများကို ပြင်ဆင်ခြင်း သို့မဟုတ် အသုံးပြုခွင့်ကို ရပ်ဆိုင်းခြင်း ပြုလုပ်နိုင်ပါသည်။ ပြင်ဆင်ချက်နောက်ပိုင်း ဆက်လက်အသုံးပြုခြင်းသည် ပြင်ဆင်ထားသော စည်းကမ်းများကို သိရှိလက်ခံခြင်း ဖြစ်ပါသည်။" },
];

export default function BurmeseTerms() {
  useSiteLocale("my", "CreatorHubPlus — ဝန်ဆောင်မှုအသုံးပြုမှု စည်းကမ်းများ");
  return <main className="privacy-page my-site">
    <header className="privacy-header"><Link href="/my" className="privacy-brand"><img src="/favicon.svg" alt="CreatorHubPlus logo" /><span>creatorhub<span>plus</span></span></Link><div className="locale-links"><Link href="/terms">English</Link><Link href="/my" className="privacy-return"><ArrowLeft size={15} /> မူလစာမျက်နှာ</Link></div></header>
    <section className="privacy-hero"><div><p className="privacy-eyebrow"><FileCheck2 size={14} /> ဝန်ဆောင်မှု စည်းကမ်းများ</p><h1>ရှင်းလင်းသော<br /><em>သဘောတူညီချက်။</em></h1></div><p>CreatorHubPlus ၏ အကူအညီ၊ ငွေပေးချေမှု တောင်းဆိုမှု၊ စစ်ဆေးမှုနှင့် တာဝန်ရှိသော အသုံးပြုမှုတို့ကို ဤအခြေခံစည်းကမ်းများက ရှင်းလင်းပေးပါသည်။</p></section>
    <section className="privacy-content"><aside className="privacy-aside"><p>နောက်ဆုံးပြင်ဆင်သည့်နေ့</p><strong>၂၆ သြဂုတ် ၂၀၂၆</strong><span>CreatorHubPlus</span><Link href="/my/privacy">ကိုယ်ရေးအချက်အလက် မူဝါဒ <ArrowUpRight size={14} /></Link></aside><div className="privacy-sections">{sections.map((section) => <article key={section.label}><span>{section.label}</span><div><h2>{section.title}</h2><p>{section.content}</p></div></article>)}</div></section>
    <footer className="privacy-footer"><p>CreatorHubPlus ဝန်ဆောင်မှု စည်းကမ်းများ</p><Link href="/my">CreatorHubPlus သို့ ပြန်သွားရန် <ArrowUpRight size={14} /></Link></footer>
  </main>;
}
