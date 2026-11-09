/** Interface copy for member messaging and profile contact flows. Never includes member-authored text. */
type Copy = Record<string, string>;
const K = [
  'Load more conversations', 'Loading conversations…', 'More conversations could not be loaded.', 'Load older messages',
  'Loading older messages…', 'Older messages could not be loaded.', 'Beginning of conversation', 'Try again',
  'Request declined', 'You declined — can still accept', 'First message sent', 'New message request', 'Conversation open',
  'No conversations yet', 'Find people', 'Conversation not found', 'Back to inbox', 'Report member', 'Block member',
  'Accept', 'Decline', 'Write a message', 'Reply and accept the conversation', 'No messages yet.', 'Select a conversation.',
  'Every conversation begins with consent.', 'Send a message', 'Reply to message', 'Send first message', 'Write your first message',
  'An initial note is required.', 'The request could not be sent. Your note is kept.', 'The action failed. Your text is kept — try again.',
] as const;
const V: Record<string, string[]> = {
  fr: ['Charger plus de conversations', 'Chargement des conversations…', 'Impossible de charger plus de conversations.', 'Charger les messages précédents', 'Chargement des messages précédents…', 'Impossible de charger les messages précédents.', 'Début de la conversation', 'Réessayer', 'Demande refusée', 'Vous avez refusé — vous pouvez encore accepter', 'Premier message envoyé', 'Nouvelle demande de message', 'Conversation ouverte', 'Aucune conversation pour le moment', 'Trouver des membres', 'Conversation introuvable', 'Retour à la messagerie', 'Signaler le membre', 'Bloquer le membre', 'Accepter', 'Refuser', 'Écrire un message', 'Répondre et accepter la conversation', 'Aucun message pour le moment.', 'Sélectionnez une conversation.', 'Chaque conversation commence par le consentement.', 'Envoyer un message', 'Répondre au message', 'Envoyer le premier message', 'Écrivez votre premier message', 'Une note initiale est requise.', 'La demande n’a pas pu être envoyée. Votre note est conservée.', 'L’action a échoué. Votre texte est conservé — réessayez.'],
  ar: ['تحميل المزيد من المحادثات', 'جارٍ تحميل المحادثات…', 'تعذّر تحميل المزيد من المحادثات.', 'تحميل الرسائل الأقدم', 'جارٍ تحميل الرسائل الأقدم…', 'تعذّر تحميل الرسائل الأقدم.', 'بداية المحادثة', 'حاول مرة أخرى', 'تم رفض الطلب', 'لقد رفضت — لا يزال بإمكانك القبول', 'تم إرسال الرسالة الأولى', 'طلب رسالة جديد', 'المحادثة مفتوحة', 'لا توجد محادثات بعد', 'البحث عن أعضاء', 'المحادثة غير موجودة', 'العودة إلى صندوق الوارد', 'الإبلاغ عن العضو', 'حظر العضو', 'قبول', 'رفض', 'اكتب رسالة', 'رد واقبل المحادثة', 'لا توجد رسائل بعد.', 'اختر محادثة.', 'كل محادثة تبدأ بالموافقة.', 'إرسال رسالة', 'الرد على الرسالة', 'إرسال الرسالة الأولى', 'اكتب رسالتك الأولى', 'الملاحظة الأولى مطلوبة.', 'تعذّر إرسال الطلب. تم الاحتفاظ بملاحظتك.', 'فشل الإجراء. تم الاحتفاظ بنصك — حاول مرة أخرى.'],
  es: ['Cargar más conversaciones', 'Cargando conversaciones…', 'No se pudieron cargar más conversaciones.', 'Cargar mensajes anteriores', 'Cargando mensajes anteriores…', 'No se pudieron cargar los mensajes anteriores.', 'Inicio de la conversación', 'Intentar de nuevo', 'Solicitud rechazada', 'La rechazaste — aún puedes aceptarla', 'Primer mensaje enviado', 'Nueva solicitud de mensaje', 'Conversación abierta', 'Aún no hay conversaciones', 'Buscar personas', 'Conversación no encontrada', 'Volver a la bandeja', 'Denunciar al miembro', 'Bloquear al miembro', 'Aceptar', 'Rechazar', 'Escribe un mensaje', 'Responde y acepta la conversación', 'Aún no hay mensajes.', 'Selecciona una conversación.', 'Cada conversación comienza con consentimiento.', 'Enviar un mensaje', 'Responder al mensaje', 'Enviar primer mensaje', 'Escribe tu primer mensaje', 'Se requiere una nota inicial.', 'No se pudo enviar la solicitud. Tu nota se conserva.', 'La acción falló. Tu texto se conserva — inténtalo de nuevo.'],
  pt: ['Carregar mais conversas', 'Carregando conversas…', 'Não foi possível carregar mais conversas.', 'Carregar mensagens anteriores', 'Carregando mensagens anteriores…', 'Não foi possível carregar as mensagens anteriores.', 'Início da conversa', 'Tentar novamente', 'Pedido recusado', 'Você recusou — ainda pode aceitar', 'Primeira mensagem enviada', 'Novo pedido de mensagem', 'Conversa aberta', 'Ainda não há conversas', 'Encontrar pessoas', 'Conversa não encontrada', 'Voltar à caixa de entrada', 'Denunciar membro', 'Bloquear membro', 'Aceitar', 'Recusar', 'Escreva uma mensagem', 'Responda e aceite a conversa', 'Ainda não há mensagens.', 'Selecione uma conversa.', 'Toda conversa começa com consentimento.', 'Enviar uma mensagem', 'Responder à mensagem', 'Enviar primeira mensagem', 'Escreva sua primeira mensagem', 'É necessária uma nota inicial.', 'Não foi possível enviar o pedido. Sua nota foi mantida.', 'A ação falhou. Seu texto foi mantido — tente novamente.'],
  sw: ['Pakia mazungumzo zaidi', 'Inapakia mazungumzo…', 'Mazungumzo zaidi hayakuweza kupakiwa.', 'Pakia ujumbe wa zamani', 'Inapakia ujumbe wa zamani…', 'Ujumbe wa zamani haukuweza kupakiwa.', 'Mwanzo wa mazungumzo', 'Jaribu tena', 'Ombi limekataliwa', 'Ulikataa — bado unaweza kukubali', 'Ujumbe wa kwanza umetumwa', 'Ombi jipya la ujumbe', 'Mazungumzo yamefunguliwa', 'Bado hakuna mazungumzo', 'Tafuta watu', 'Mazungumzo hayakupatikana', 'Rudi kwenye kikasha', 'Ripoti mwanachama', 'Zuia mwanachama', 'Kubali', 'Kataa', 'Andika ujumbe', 'Jibu na ukubali mazungumzo', 'Bado hakuna ujumbe.', 'Chagua mazungumzo.', 'Kila mazungumzo huanza kwa ridhaa.', 'Tuma ujumbe', 'Jibu ujumbe', 'Tuma ujumbe wa kwanza', 'Andika ujumbe wako wa kwanza', 'Ujumbe wa utangulizi unahitajika.', 'Ombi halikuweza kutumwa. Ujumbe wako umehifadhiwa.', 'Kitendo kimeshindwa. Maandishi yako yamehifadhiwa — jaribu tena.'],
  zh: ['加载更多对话', '正在加载对话…', '无法加载更多对话。', '加载更早的消息', '正在加载更早的消息…', '无法加载更早的消息。', '对话开始', '重试', '请求已被拒绝', '您已拒绝——仍可接受', '首条消息已发送', '新的消息请求', '对话已开启', '暂无对话', '查找成员', '未找到对话', '返回收件箱', '举报成员', '屏蔽成员', '接受', '拒绝', '写一条消息', '回复即可接受对话', '暂无消息。', '请选择一个对话。', '每一次对话都始于同意。', '发送消息', '回复消息', '发送首条消息', '写下您的首条消息', '需要填写初始留言。', '请求未能发送。您的留言已保留。', '操作失败。您的文字已保留——请重试。'],
};
export const messagingCopy: Record<string, Copy> = Object.fromEntries(
  Object.entries(V).map(([lang, values]) => [lang, Object.fromEntries(K.map((k, i) => [k, values[i]]))]),
);

// The long, non-member-authored explanations changed with first-contact rules.
// Deliberately exclude user-authored messages, names and drafts from this copy.
const MORE_KEYS = [
  'Ordinary messaging is free across all 17 sectors, without daily contact quotas or a pending-request limit. Send a first message immediately. The recipient can reply to open the conversation, accept, decline, block or report. Short-term security protections still apply. TOMI-organized professional introductions remain a separate service.',
  'Ordinary messaging is free across all 17 sectors. There is no daily contact quota or pending-request limit. Your first message is delivered immediately; a reply or acceptance opens the conversation. Recipients can decline, block or report. Short-term security protections still apply.',
  'Visit a member profile and send a first message. They can reply, accept or decline.',
  'First message sent. You can continue when',
  'replies or accepts.',
  'sent you a first message. Reply below to accept automatically, or choose an action.',
] as const;
const MORE: Record<string, string[]> = {
  fr: [
    'La messagerie ordinaire est gratuite dans les 17 secteurs, sans quota quotidien de contacts ni limite de demandes en attente. Envoyez immédiatement un premier message. Le destinataire peut répondre pour ouvrir la conversation, accepter, refuser, bloquer ou signaler. Les protections de sécurité à court terme restent en place. Les présentations professionnelles organisées par TOMI constituent un service distinct.',
    'La messagerie ordinaire est gratuite dans les 17 secteurs. Il n’y a ni quota quotidien de contacts ni limite de demandes en attente. Votre premier message est transmis immédiatement ; une réponse ou une acceptation ouvre la conversation. Le destinataire peut refuser, bloquer ou signaler. Les protections de sécurité à court terme restent en place.',
    'Consultez le profil d’un membre et envoyez un premier message. Il peut répondre, accepter ou refuser.',
    'Premier message envoyé. Vous pourrez continuer quand', 'répondra ou acceptera.',
    'vous a envoyé un premier message. Répondez ci-dessous pour accepter automatiquement, ou choisissez une action.',
  ],
  ar: [
    'المراسلة العادية مجانية في جميع القطاعات السبعة عشر، دون حصة يومية لجهات الاتصال أو حد للطلبات المعلّقة. أرسل رسالة أولى فورًا. يمكن للمستلم الرد لفتح المحادثة أو قبولها أو رفضها أو حظرها أو الإبلاغ عنها. تبقى وسائل الحماية الأمنية قصيرة الأمد سارية. التعارف المهني الذي تنظمه TOMI خدمة منفصلة.',
    'المراسلة العادية مجانية في جميع القطاعات السبعة عشر. لا توجد حصة يومية لجهات الاتصال أو حد للطلبات المعلّقة. تصل رسالتك الأولى فورًا؛ ويؤدي الرد أو القبول إلى فتح المحادثة. يمكن للمستلم الرفض أو الحظر أو الإبلاغ. تبقى وسائل الحماية الأمنية قصيرة الأمد سارية.',
    'افتح ملف أحد الأعضاء وأرسل رسالة أولى. يمكنه الرد أو القبول أو الرفض.',
    'أُرسلت الرسالة الأولى. يمكنك المتابعة عندما', 'يرد أو يقبل.',
    'أرسل إليك رسالة أولى. رد أدناه لقبول المحادثة تلقائيًا، أو اختر إجراءً.',
  ],
  es: [
    'La mensajería habitual es gratuita en los 17 sectores, sin cuota diaria de contactos ni límite de solicitudes pendientes. Envía un primer mensaje de inmediato. El destinatario puede responder para abrir la conversación, aceptarla, rechazarla, bloquear o denunciar. Siguen vigentes las protecciones de seguridad a corto plazo. Las presentaciones profesionales organizadas por TOMI son un servicio aparte.',
    'La mensajería habitual es gratuita en los 17 sectores. No hay cuota diaria de contactos ni límite de solicitudes pendientes. Tu primer mensaje se entrega de inmediato; una respuesta o aceptación abre la conversación. El destinatario puede rechazar, bloquear o denunciar. Siguen vigentes las protecciones de seguridad a corto plazo.',
    'Visita el perfil de un miembro y envía un primer mensaje. Puede responder, aceptar o rechazar.',
    'Primer mensaje enviado. Podrás continuar cuando', 'responda o acepte.',
    'te envió un primer mensaje. Responde abajo para aceptar automáticamente o elige una acción.',
  ],
  pt: [
    'As mensagens comuns são gratuitas nos 17 setores, sem limite diário de contatos nem limite de solicitações pendentes. Envie uma primeira mensagem imediatamente. O destinatário pode responder para abrir a conversa, aceitar, recusar, bloquear ou denunciar. As proteções de segurança de curto prazo continuam. As apresentações profissionais organizadas pela TOMI são um serviço separado.',
    'As mensagens comuns são gratuitas nos 17 setores. Não há limite diário de contatos nem limite de solicitações pendentes. Sua primeira mensagem é entregue imediatamente; uma resposta ou aceitação abre a conversa. O destinatário pode recusar, bloquear ou denunciar. As proteções de segurança de curto prazo continuam.',
    'Visite o perfil de um membro e envie uma primeira mensagem. Ele pode responder, aceitar ou recusar.',
    'Primeira mensagem enviada. Você poderá continuar quando', 'responder ou aceitar.',
    'enviou uma primeira mensagem. Responda abaixo para aceitar automaticamente ou escolha uma ação.',
  ],
  sw: [
    'Ujumbe wa kawaida ni bure katika sekta zote 17, bila kiwango cha kila siku cha kuwasiliana au kikomo cha maombi yanayosubiri. Tuma ujumbe wa kwanza mara moja. Mpokeaji anaweza kujibu ili kufungua mazungumzo, kukubali, kukataa, kuzuia au kuripoti. Ulinzi wa usalama wa muda mfupi unaendelea. Utambulisho wa kitaaluma unaoratibiwa na TOMI ni huduma tofauti.',
    'Ujumbe wa kawaida ni bure katika sekta zote 17. Hakuna kiwango cha kila siku cha kuwasiliana wala kikomo cha maombi yanayosubiri. Ujumbe wako wa kwanza unafika mara moja; jibu au kukubaliwa hufungua mazungumzo. Mpokeaji anaweza kukataa, kuzuia au kuripoti. Ulinzi wa usalama wa muda mfupi unaendelea.',
    'Tembelea wasifu wa mwanachama na utume ujumbe wa kwanza. Anaweza kujibu, kukubali au kukataa.',
    'Ujumbe wa kwanza umetumwa. Unaweza kuendelea', 'akijibu au akikubali.',
    'amekutumia ujumbe wa kwanza. Jibu hapa chini ili kukubali moja kwa moja, au chagua hatua.',
  ],
  zh: [
    '17 个领域的普通消息均免费，没有每日新联系人限额或待处理请求数量上限。你可以立即发送首条消息。收件人可以回复以开启对话，也可以接受、拒绝、屏蔽或举报。短时安全防护仍然有效。TOMI 组织的专业引荐属于另一项服务。',
    '17 个领域的普通消息均免费。没有每日新联系人限额或待处理请求数量上限。首条消息会立即送达；回复或接受后，对话即可开启。收件人可以拒绝、屏蔽或举报。短时安全防护仍然有效。',
    '访问成员个人资料并发送首条消息。对方可以回复、接受或拒绝。',
    '首条消息已发送。对方', '回复或接受后，你就可以继续。',
    '给你发送了首条消息。回复下方消息即可自动接受，或选择其他操作。',
  ],
};
for (const [lang, values] of Object.entries(MORE)) {
  Object.assign(messagingCopy[lang], Object.fromEntries(MORE_KEYS.map((key, i) => [key, values[i]])));
}
