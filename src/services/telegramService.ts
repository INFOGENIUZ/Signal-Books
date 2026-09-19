// Telegram Web App Integration Service

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: TelegramUser;
          receiver?: TelegramUser;
          chat?: any;
          start_param?: string;
          auth_date?: string;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
      };
    };
  }
}

class TelegramServiceClass {
  private backButtonCallbacks: (() => void)[] = [];

  get isAvailable(): boolean {
    return Boolean(typeof window !== 'undefined' && window.Telegram?.WebApp);
  }

  get isInsideTelegram(): boolean {
    if (!this.isAvailable) return false;
    const tg = window.Telegram?.WebApp;
    return Boolean(tg && (tg.initData || tg.platform !== 'unknown'));
  }

  init(): void {
    if (!this.isAvailable) return;

    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      tg.ready();
      tg.expand();

      // Theme matching for dark amber library
      try {
        tg.setHeaderColor('#120D08');
        tg.setBackgroundColor('#0C0A08');
      } catch (e) {
        // older clients might ignore
      }

      // Keep expanded
      if (!tg.isExpanded) {
        tg.expand();
      }
    } catch (err) {
      console.warn('Telegram WebApp init warning:', err);
    }
  }

  getTelegramUser(): TelegramUser | null {
    if (!this.isAvailable) return null;
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  }

  // Returns unique stable ID for current user (either from Telegram or persistent client UUID)
  getUserId(): string {
    const tgUser = this.getTelegramUser();
    if (tgUser && tgUser.id) {
      return `tg_${tgUser.id}`;
    }

    // Fallback: persistent anonymous user ID in localStorage
    try {
      let anonId = localStorage.getItem('signal_persistent_user_id');
      if (!anonId) {
        anonId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('signal_persistent_user_id', anonId);
      }
      return anonId;
    } catch {
      return 'usr_guest_default';
    }
  }

  getUserDisplayName(): string {
    const tgUser = this.getTelegramUser();
    if (tgUser) {
      const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
      return name || (tgUser.username ? `@${tgUser.username}` : 'Kitobxon');
    }
    return 'Foydalanuvchi';
  }

  getUserAvatar(): string | null {
    const tgUser = this.getTelegramUser();
    return tgUser?.photo_url || null;
  }

  // Haptic feedback triggers
  hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    } catch {}
  }

  hapticSuccess(): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch {}
  }

  hapticError(): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } catch {}
  }

  hapticSelection(): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    } catch {}
  }

  // Native Telegram Back Button integration
  setBackButton(show: boolean, onClick?: () => void): void {
    if (!this.isAvailable) return;
    const bb = window.Telegram?.WebApp?.BackButton;
    if (!bb) return;

    // Clear previous callbacks
    this.backButtonCallbacks.forEach(cb => {
      try {
        bb.offClick(cb);
      } catch {}
    });
    this.backButtonCallbacks = [];

    if (show && onClick) {
      this.backButtonCallbacks.push(onClick);
      bb.onClick(onClick);
      bb.show();
    } else {
      bb.hide();
    }
  }

  // Native Telegram Main Button
  setMainButton(options: {
    show: boolean;
    text?: string;
    onClick?: () => void;
    color?: string;
  }): void {
    if (!this.isAvailable) return;
    const mb = window.Telegram?.WebApp?.MainButton;
    if (!mb) return;

    if (options.show && options.text) {
      mb.setText(options.text);
      if (options.color) {
        mb.setParams({ color: options.color, text_color: '#0B0806' });
      }
      if (options.onClick) {
        mb.onClick(options.onClick);
      }
      mb.show();
      mb.enable();
    } else {
      mb.hide();
    }
  }
}

export const TelegramService = new TelegramServiceClass();
