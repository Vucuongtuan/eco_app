import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const Breadcrumbs = ({breadcrumbs}: {breadcrumbs: {label: string; href?: string}[]}) => {
    const t = useTranslations('common')
    
    return (
        <>
           {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {t('home')}
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="text-border">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        </>
    )
}