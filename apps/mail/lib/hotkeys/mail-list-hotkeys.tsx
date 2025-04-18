'use client';

import { markAsUnread as markAsUnreadAction } from '@/actions/mail';
import { keyboardShortcuts } from '@/config/shortcuts';
import { useCallback, useEffect, useRef } from 'react';
import { useMail } from '@/components/mail/use-mail';
import { useShortcuts } from './use-hotkey-utils';
import { useThreads } from '@/hooks/use-threads';
import { useStats } from '@/hooks/use-stats';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function MailListHotkeys() {
  const scope = 'mail-list';
  const [mail, setMail] = useMail();
  const {
    data: { threads: items },
    mutate,
  } = useThreads();
  const { mutate: mutateStats } = useStats();
  const t = useTranslations();
  const hoveredEmailId = useRef<string | null>(null);

  useEffect(() => {
    const handleEmailHover = (event: CustomEvent<{ id: string | null }>) => {
      hoveredEmailId.current = event.detail.id;
    };

    window.addEventListener('emailHover', handleEmailHover as EventListener);
    return () => {
      window.removeEventListener('emailHover', handleEmailHover as EventListener);
    };
  }, []);

  const selectAll = useCallback(() => {
    if (mail.bulkSelected.length > 0) {
      setMail((prev) => ({
        ...prev,
        bulkSelected: [],
      }));
    } else if (items.length > 0) {
      const allIds = items.map((item) => item.id);
      setMail((prev) => ({
        ...prev,
        bulkSelected: allIds,
      }));
    } else {
      toast.info(t('common.mail.noEmailsToSelect'));
    }
  }, [items, mail.bulkSelected, setMail, t]);

  const markAsUnread = useCallback(() => {
    if (hoveredEmailId.current) {
      toast.promise(markAsUnreadAction({ ids: [hoveredEmailId.current] }), {
        loading: t('common.actions.loading'),
        success: async () => {
          await Promise.all([mutate(), mutateStats()]);
          return t('common.mail.markedAsUnread');
        },
        error: t('common.mail.failedToMarkAsUnread'),
      });
      return;
    }

    const idsToMark = mail.bulkSelected;
    if (idsToMark.length === 0) {
      toast.info(t('common.mail.noEmailsToSelect'));
      return;
    }

    toast.promise(markAsUnreadAction({ ids: idsToMark }), {
      loading: t('common.actions.loading'),
      success: async () => {
        await Promise.all([mutate(), mutateStats()]);
        return t('common.mail.markedAsUnread');
      },
      error: t('common.mail.failedToMarkAsUnread'),
    });
  }, [mail.bulkSelected, mutate, mutateStats, t]);

  const handlers = {
    markAsUnread,
    selectAll,
  };

  const mailListShortcuts = keyboardShortcuts.filter((shortcut) => shortcut.scope === scope);

  useShortcuts(mailListShortcuts, handlers, { scope });

  return null;
}
