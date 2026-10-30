const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]!);

export function profileReminderMessage(input: {
  firstName: string; email: string; profileUrl: string; site: string;
  contact: string; preferencesUrl?: string;
}) {
  const subject = "Complete Your Profile — The One Movement";
  const greeting = `Hello ${input.firstName},`;
  const introduction = "Welcome to The One Movement International!";
  const invitation = "Your account is ready. Complete your profile to connect with members, share your work, discover opportunities and grow your network.";
  const signIn = `Sign in with the account that received this email (${input.email}). This link does not replace email verification or grant access to another account.`;
  const preference = input.preferencesUrl
    ? `Stop non-essential profile reminders: ${input.preferencesUrl}`
    : "Each email includes a link to stop non-essential profile reminders.";
  const text = `${greeting}\n\n${introduction}\n\n${invitation}\n\nCOMPLETE MY PROFILE\n${input.profileUrl}\n\n${signIn}\n\nOrdinary membership is free. Access opens automatically after email verification and your basic profile. Directory visibility stays your choice; official programme approvals remain separate.\n\nWE ARE ONE.\n\nThe One Movement International\n${input.site}\nContact: ${input.contact}\n\n${preference}`;
  const e = escapeHtml;
  const html = `<!doctype html><html><body style="margin:0;background:#f5f1e6;font-family:Arial,sans-serif;color:#183739"><div style="max-width:580px;margin:24px auto;border:1px solid #d5c8ac;background:#fffcf5"><div style="padding:28px;background:#10383b;color:#f9f5e8"><strong style="font-size:22px">THE ONE MOVEMENT</strong><br><span style="letter-spacing:3px;font-size:11px;color:#d1ae61">INTERNATIONAL</span></div><div style="padding:28px"><p>${e(greeting)}</p><h1 style="font-size:23px;line-height:1.3">${e(introduction)}</h1><p style="line-height:1.7">${e(invitation)}</p><p style="margin:28px 0"><a href="${e(input.profileUrl)}" style="display:inline-block;padding:15px 22px;background:#bd984d;color:#122d30;text-decoration:none;font-weight:bold">COMPLETE MY PROFILE</a></p><p style="font-size:12px;line-height:1.6">${e(signIn)}</p><p style="font-size:12px;line-height:1.6">Ordinary membership is free. Access opens automatically after email verification and your basic profile. Directory visibility stays your choice; official programme approvals remain separate.</p><p style="font-weight:bold;color:#846222">WE ARE ONE.</p><p style="font-size:13px;line-height:1.8">The One Movement International<br><a href="${e(input.site)}">${e(input.site)}</a><br>Contact: <a href="mailto:${e(input.contact)}">${e(input.contact)}</a></p></div><div style="padding:18px 28px;border-top:1px solid #d5c8ac;font-size:12px">${input.preferencesUrl ? `<a href="${e(input.preferencesUrl)}">Stop non-essential profile reminders</a>` : e(preference)}</div></div></body></html>`;
  return { subject, text, html };
}
