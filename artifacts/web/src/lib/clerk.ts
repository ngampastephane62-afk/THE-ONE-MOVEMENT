import { shadcn } from '@clerk/themes';

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(39 52% 54%)',
    colorForeground: 'hsl(30 37% 7%)',
    colorMutedForeground: 'hsl(29 30% 30%)',
    colorDanger: 'hsl(0 45% 38%)',
    colorBackground: 'hsl(40 71% 98%)',
    colorInput: 'hsl(40 71% 98%)',
    colorInputForeground: 'hsl(30 37% 7%)',
    colorNeutral: 'hsl(30 20% 30%)',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    borderRadius: '0.25rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[hsl(40_71%_98%)] rounded-sm w-[440px] max-w-full overflow-hidden border border-[hsl(39_52%_54%/0.45)] shadow-[0_30px_80px_hsl(187_67%_4%/0.45)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: "text-[hsl(187_67%_12%)] tracking-[0.08em] uppercase [font-family:'Cinzel',Georgia,serif]",
    headerSubtitle: 'text-[hsl(29_30%_30%)]',
    socialButtonsBlockButtonText: 'text-[hsl(30_37%_7%)] font-medium',
    formFieldLabel: 'text-[hsl(30_37%_7%)] font-medium',
    footerActionLink: 'text-[hsl(189_78%_24%)] font-semibold hover:text-[hsl(37_55%_40%)]',
    footerActionText: 'text-[hsl(29_30%_30%)]',
    dividerText: 'text-[hsl(29_30%_35%)]',
    identityPreviewEditButton: 'text-[hsl(189_78%_24%)]',
    formFieldSuccessText: 'text-[hsl(189_78%_24%)]',
    alertText: 'text-[hsl(0_45%_32%)]',
    logoBox: 'justify-center',
    logoImage: 'h-12 w-12',
    socialButtonsBlockButton: 'border border-[hsl(36_26%_74%)] bg-[hsl(38_57%_94%)] hover:bg-[hsl(38_44%_87%)]',
    formButtonPrimary: 'bg-[hsl(187_67%_12%)] text-[hsl(38_57%_94%)] hover:bg-[hsl(188_66%_16%)] uppercase tracking-[0.12em] text-xs',
    formFieldInput: 'border border-[hsl(36_26%_74%)] bg-[hsl(40_71%_98%)] text-[hsl(30_37%_7%)]',
    footerAction: 'bg-[hsl(38_57%_94%)]',
    dividerLine: 'bg-[hsl(36_26%_74%)]',
    alert: 'border border-[hsl(0_45%_32%/0.3)] bg-[hsl(0_45%_32%/0.06)]',
    otpCodeFieldInput: 'border border-[hsl(36_26%_74%)] text-[hsl(30_37%_7%)]',
    formFieldRow: 'gap-3',
    main: 'gap-5',
  },
};

export const clerkLocalization = {
  signIn: {
    start: {
      title: 'Welcome back',
      subtitle: 'Sign in to your TOMI member space',
    },
  },
  signUp: {
    start: {
      title: 'Create your member space',
      subtitle: 'A private workspace across the TOMI ecosystem',
    },
  },
};
