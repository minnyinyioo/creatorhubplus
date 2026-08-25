import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LockKeyhole, X } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export type CaseServiceKey = "platform_earnings" | "payout_receiving" | "account_setup" | "address_support";

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  platform: string;
  platformPlaceholder: string;
  summary: string;
  summaryPlaceholder: string;
  details: string;
  detailsPlaceholder: string;
  privacy: string;
  cancel: string;
  submit: string;
  submitting: string;
  signIn: string;
  required: string;
  success: (code: string) => string;
  error: string;
};

const copy: Record<"en" | "my", Copy> = {
  en: {
    eyebrow: "CASE INTAKE / 01",
    title: "Give the issue a clear starting point.",
    intro: "Tell us what is blocked. Use the platform’s real name and leave out passwords, PINs, card numbers and wallet credentials.",
    platform: "Platform or service",
    platformPlaceholder: "e.g. Facebook, YouTube, TikTok or PayPal",
    summary: "What is stopping progress?",
    summaryPlaceholder: "A short description of the issue",
    details: "What have you tried so far?",
    detailsPlaceholder: "Share the current page state, the message you see and the steps already tried.",
    privacy: "Your account email is used for this case record. We do not ask for payment credentials or false verification material.",
    cancel: "Not now",
    submit: "Create support case",
    submitting: "Creating case…",
    signIn: "Sign in to submit",
    required: "Please complete the required fields before submitting.",
    success: (code) => `Case ${code} is open. We will keep the next step visible here.`,
    error: "We could not create the case. Please try again.",
  },
  my: {
    eyebrow: "တောင်းဆိုမှု / ၀၁",
    title: "အခက်အခဲကို ရှင်းလင်းစွာ စတင်ဖော်ပြပါ။",
    intro: "ရပ်တန့်နေသည့်အချက်ကို ဖော်ပြပါ။ ပလက်ဖောင်းအမည်ကို မှန်ကန်စွာရေးပြီး စကားဝှက်၊ PIN၊ ကတ်နံပါတ်နှင့် wallet အကောင့်အချက်အလက်များကို မထည့်ပါနှင့်။",
    platform: "ပလက်ဖောင်း သို့မဟုတ် ဝန်ဆောင်မှု",
    platformPlaceholder: "ဥပမာ Facebook၊ YouTube၊ TikTok သို့မဟုတ် PayPal",
    summary: "မည်သည့်အချက်ကြောင့် ဆက်လက်မလုပ်ဆောင်နိုင်သနည်း။",
    summaryPlaceholder: "အခက်အခဲကို အတိုချုံးဖော်ပြပါ",
    details: "ယခုအချိန်အထိ မည်သို့ကြိုးစားခဲ့ပါသလဲ။",
    detailsPlaceholder: "လက်ရှိစာမျက်နှာအခြေအနေ၊ တွေ့ရသည့်စာသားနှင့် ကြိုးစားခဲ့သည့်အဆင့်များကို ဖော်ပြပါ။",
    privacy: "ဤတောင်းဆိုမှုမှတ်တမ်းအတွက် သင့်အကောင့်အီးမေးလ်ကို အသုံးပြုပါမည်။ ငွေပေးချေမှုအချက်အလက် သို့မဟုတ် အတည်ပြုမှုအတုအယောင်များကို မတောင်းဆိုပါ။",
    cancel: "ယခု မလုပ်သေးပါ",
    submit: "အကူအညီတောင်းဆိုမှု ဖန်တီးရန်",
    submitting: "တောင်းဆိုမှု ဖန်တီးနေသည်…",
    signIn: "တင်သွင်းရန် အကောင့်ဝင်ပါ",
    required: "လိုအပ်သောအချက်များကို ဖြည့်စွက်ပြီးမှ တင်သွင်းပါ။",
    success: (code) => `${code} တောင်းဆိုမှုကို ဖွင့်လှစ်ပြီးပါပြီ။ နောက်တစ်ဆင့်ကို ဤနေရာတွင် စောင့်ကြည့်နိုင်ပါသည်။`,
    error: "တောင်းဆိုမှု ဖန်တီး၍ မရပါ။ ထပ်မံကြိုးစားပါ။",
  },
};

export default function CaseIntakeDialog({
  open,
  serviceKey,
  serviceLabel,
  locale = "en",
  onClose,
}: {
  open: boolean;
  serviceKey: CaseServiceKey;
  serviceLabel: string;
  locale?: "en" | "my";
  onClose: () => void;
}) {
  const strings = copy[locale];
  const { isAuthenticated, loading } = useAuth();
  const [platformName, setPlatformName] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [details, setDetails] = useState("");
  const createMutation = trpc.supportCase.create.useMutation({
    onSuccess: ({ caseCode }) => {
      toast(strings.success(caseCode));
      setPlatformName("");
      setIssueSummary("");
      setDetails("");
      onClose();
    },
    onError: (error) => toast(error.message || strings.error),
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createMutation.isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [createMutation.isPending, onClose, open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!platformName.trim() || !issueSummary.trim() || details.trim().length < 20) {
      toast(strings.required);
      return;
    }
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    createMutation.mutate({
      serviceKey,
      platformName: platformName.trim(),
      issueSummary: issueSummary.trim(),
      details: details.trim(),
    });
  };

  return (
    <div className="case-dialog-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !createMutation.isPending) onClose(); }}>
      <section className="case-dialog" role="dialog" aria-modal="true" aria-labelledby="case-dialog-title">
        <div className="case-dialog-head">
          <div><p className="payout-eyebrow"><span /> {strings.eyebrow}</p><span className="case-dialog-service">{serviceLabel}</span><h2 id="case-dialog-title">{strings.title}</h2></div>
          <button type="button" className="case-dialog-close" onClick={onClose} disabled={createMutation.isPending} aria-label="Close"><X size={20} /></button>
        </div>
        <p className="case-dialog-intro">{strings.intro}</p>
        <form className="case-dialog-form" onSubmit={submit}>
          <label>{strings.platform}<input value={platformName} onChange={(event) => setPlatformName(event.target.value.slice(0, 100))} placeholder={strings.platformPlaceholder} autoFocus maxLength={100} /></label>
          <label>{strings.summary}<input value={issueSummary} onChange={(event) => setIssueSummary(event.target.value.slice(0, 180))} placeholder={strings.summaryPlaceholder} maxLength={180} /></label>
          <label className="case-dialog-wide">{strings.details}<textarea value={details} onChange={(event) => setDetails(event.target.value.slice(0, 2000))} placeholder={strings.detailsPlaceholder} minLength={20} maxLength={2000} /><small>{details.length}/2,000</small></label>
          <div className="case-dialog-safety"><LockKeyhole size={16} /><span>{strings.privacy}</span></div>
          <div className="case-dialog-actions"><button type="button" className="case-dialog-cancel" onClick={onClose} disabled={createMutation.isPending}>{strings.cancel}</button><button type="submit" className="case-dialog-submit" disabled={loading || createMutation.isPending}>{createMutation.isPending ? strings.submitting : isAuthenticated ? <>{strings.submit} <ArrowUpRight size={16} /></> : <>{strings.signIn} <ArrowUpRight size={16} /></>}</button></div>
        </form>
      </section>
    </div>
  );
}
