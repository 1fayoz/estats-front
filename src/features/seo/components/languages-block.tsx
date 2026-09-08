import { AlertTriangle, Check, Languages } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeoLanguage } from "@/lib/types";
import styles from "@/app/(dashboard)/seo/[id]/seo-detail.module.css";

export function LanguagesBlock({ languages }: { languages: SeoLanguage[] }) {
  const shown = languages.filter((language) => language.coverageTotal > 0 || language.filled);
  if (shown.length < 2) return null;

  const weakest = shown.reduce((current, language) => current.score <= language.score ? current : language);

  return (
    <section className={styles.languages} aria-labelledby="languages-heading">
      <div className={styles.blockHeading}>
        <span className={styles.blockIcon}><Languages aria-hidden="true" /></span>
        <div>
          <h2 id="languages-heading">Tillar bo&apos;yicha natija</h2>
          <p>Har bir til alohida o&apos;lchanadi — kuchsiz matn umumiy ballda yashirinib qolmaydi.</p>
        </div>
      </div>
      <div className={styles.languageGrid}>
        {shown.map((language) => (
          <LanguageCard
            key={language.language}
            language={language}
            weakest={shown.length > 1 && language.language === weakest.language && language.score < 60}
          />
        ))}
      </div>
    </section>
  );
}

function LanguageCard({ language, weakest }: { language: SeoLanguage; weakest: boolean }) {
  const share = Math.round((language.weight || 0) * 100);
  const percent = Math.min(100, Math.round((language.score / 85) * 100));
  const tone = percent >= 70 ? styles.goodTone : percent >= 40 ? styles.warningTone : styles.badTone;

  return (
    <article className={cn(styles.languageCard, weakest && styles.weakLanguage)}>
      <div className={styles.languageTop}>
        <div>
          <span className={styles.languageLabel}>{language.name}</span>
          <p>Talabning {share}% ulushi</p>
        </div>
        <strong className={tone}>{language.score}<small>/85</small></strong>
      </div>
      <div className={styles.languageProgress}><span className={tone} style={{ width: `${percent}%` }} /></div>
      <dl className={styles.languageParts}>
        <Part label="Nom" value={language.titleScore} max={25} />
        <Part label="Tavsif" value={language.descriptionScore} max={20} />
        <Part label="Kalit so'z" value={language.keywordScore} max={40} />
      </dl>
      <dl className={styles.languageFacts}>
        <Row label="Qamralgan" value={`${formatNumber(language.coverageUsed)} / ${formatNumber(language.coverageTotal)}`} />
        <Row label="Kalit so'z" value={`${language.keywordsUsed} / ${language.keywordsTotal}`} />
        <Row label="Nom uzunligi" value={language.titleLength ? `${language.titleLength} belgi` : "yo'q"} />
        <Row label="Tavsif uzunligi" value={language.descriptionLength ? `${language.descriptionLength} belgi` : "yo'q"} />
      </dl>
      {language.filled && language.scriptOk === false ? (
        <p className={styles.languageNotice}><AlertTriangle aria-hidden="true" /><span>Kartochkada bu til o&apos;rniga boshqa tildagi matn turibdi{language.mirrorsOther ? " — ikkinchi tilning aynan nusxasi." : "."}</span></p>
      ) : language.missing.length ? (
        <p className={styles.languageNotice}><AlertTriangle aria-hidden="true" /><span>Yetishmayapti: <strong>{language.missing.slice(0, 3).join(", ")}</strong></span></p>
      ) : (
        <p className={styles.languageSuccess}><Check aria-hidden="true" /> Yadro to&apos;liq ishlatilgan</p>
      )}
    </article>
  );
}

function Part({ label, value, max }: { label: string; value: number; max: number }) {
  return <div><dt>{label}</dt><dd>{value}<small>/{max}</small></dd></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
