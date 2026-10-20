import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './ArticleEditorLayout.module.css';

export default function EditorBox({ title, icon, children, collapsible = true }: {
  title: string; icon?: ReactNode; children: ReactNode; collapsible?: boolean;
}) {
  const heading = <span className={styles.boxHeading}>{icon}{title}</span>;
  return collapsible ? (
    <details className={styles.box} open>
      <summary className={styles.boxHeader}>{heading}<ChevronDown size={16} aria-hidden="true" /></summary>
      <div className={styles.boxBody}>{children}</div>
    </details>
  ) : (
    <section className={styles.box}>
      <div className={styles.boxHeader}><h2>{heading}</h2></div>
      <div className={styles.boxBody}>{children}</div>
    </section>
  );
}
