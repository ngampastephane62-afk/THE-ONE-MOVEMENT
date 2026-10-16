import { SOCIAL_PROFILES } from '@workspace/shared';

const copy: Record<string, [string, string, (name: string) => string]> = {
  fr: [
    'RÉSEAUX SOCIAUX',
    'Ajoutez les liens de vos profils. Ils apparaissent sur votre profil membre et, si vous le rendez public, sur votre page publique. Ces liens ne connectent pas vos comptes et n’importent aucune publication. Pour retirer un lien, effacez le champ puis enregistrez.',
    name => `Utilisez l’adresse HTTPS complète de votre profil ${name}, ou laissez le champ vide.`,
  ],
  ar: [
    'الحسابات الاجتماعية',
    'أضف روابط حساباتك. تظهر في ملفك للأعضاء، وعلى صفحتك العامة إذا جعلته عامًا. هذه الروابط لا تربط الحسابات ولا تستورد المنشورات. لإزالة رابط، امسح الحقل واحفظ.',
    name => `أدخل عنوان HTTPS الكامل لحساب ${name}، أو اترك الحقل فارغًا.`,
  ],
  es: [
    'PERFILES SOCIALES',
    'Añade los enlaces de tus perfiles. Aparecen en tu perfil de miembro y, si lo haces público, en tu página pública. Estos enlaces no conectan las cuentas ni importan publicaciones. Borra un campo y guarda para eliminar un enlace.',
    name => `Usa la dirección HTTPS completa de tu perfil de ${name}, o deja el campo vacío.`,
  ],
  pt: [
    'PERFIS SOCIAIS',
    'Adicione os links dos seus perfis. Aparecem no perfil de membro e, se o tornar público, na página pública. Estes links não conectam contas nem importam publicações. Limpe um campo e guarde para remover um link.',
    name => `Use o endereço HTTPS completo do seu perfil ${name}, ou deixe o campo vazio.`,
  ],
  sw: [
    'WASIFU WA MITANDAO YA KIJAMII',
    'Ongeza viungo vya wasifu wako. Vitaonekana kwenye wasifu wa mwanachama na kwenye ukurasa wa umma ukiufanya kuwa wa umma. Viungo hivi haviunganishi akaunti wala kuleta machapisho. Futa sehemu na uhifadhi ili kuondoa kiungo.',
    name => `Tumia anwani kamili ya HTTPS ya wasifu wako wa ${name}, au acha sehemu tupu.`,
  ],
  zh: [
    '社交账号',
    '添加你的个人主页链接。链接将显示在会员资料中；如果你公开资料，也会显示在公开页面上。这些链接不会连接账号或导入帖子。清空字段并保存即可移除链接。',
    name => `请输入完整的 ${name} 个人主页 HTTPS 地址，或留空。`,
  ],
};

const description = 'Add your profile links. These links appear on your member profile and, if you make it public, on your public page. They do not connect your accounts or import posts. Clear a field and save to remove a link.';
export const socialProfileCopy: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(copy).map(([lang, [title, body, invalid]]) => [lang, {
    'SOCIAL PROFILES': title,
    [description]: body,
    ...Object.fromEntries(SOCIAL_PROFILES.map(({ name }) => [
      `Use a complete HTTPS ${name} profile address, or leave it empty.`, invalid(name),
    ])),
  }]),
);
