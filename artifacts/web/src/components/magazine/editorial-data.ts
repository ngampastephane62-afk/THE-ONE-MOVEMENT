// Faithful transcriptions of the supplied Tropik Magazine layouts and the 2026 media kit.
// Do not paraphrase or extend: every sentence below appears in the source artwork/PDF.

export const ART = (n: number) => `${import.meta.env.BASE_URL}api/magazine/assets/artwork-${String(n).padStart(2, '0')}.webp`;
export const KIT_PAGE = (n: number) => `${import.meta.env.BASE_URL}api/magazine/assets/kit-page-${String(n).padStart(2, '0')}.webp`;
export const HERITAGE = (n: number) => `${import.meta.env.BASE_URL}api/magazine/assets/heritage-${String(n).padStart(2, '0')}.webp`;
export const PRINT_READER = `${import.meta.env.BASE_URL}api/magazine/assets/print-reader-01.webp`;
export const KIT_PDF_URL = `${import.meta.env.BASE_URL}api/magazine/kit.pdf`;

export type Block =
  | { t: 'p'; text: string; lead?: boolean }
  | { t: 'h'; text: string }
  | { t: 'quote'; text: string; by?: string }
  | { t: 'list'; title?: string; items: string[] }
  | { t: 'callout'; title: string; text: string[] };

export type Chapter = { id: string; page: string; kicker: string; title: string; deck?: string; art: number; artAlt: string; caption?: string[]; blocks: Block[] };

export type Article = {
  slug: string; edition: string; tags: string; name: string; headline: string; deck: string;
  accent: 'pink' | 'gold' | 'night'; chapters: Chapter[]; health?: boolean;
};

export const ARTICLES: Article[] = [
  {
    slug: 'carine-nanikian', edition: 'October Pink 2026', tags: 'Women · Stories · Health · Empowerment · Change',
    name: 'Carine Nanikian', headline: 'Her story. Her courage. Her hope.',
    deck: 'A woman. A mother. A professional. A woman of faith.', accent: 'pink', health: true,
    chapters: [
      {
        id: 'carine-her-story', page: '02', kicker: 'A woman · A journey · A message', title: 'Her Story', deck: 'The moment everything changed.',
        art: 7, artAlt: 'Tropik Magazine page 02: Carine Nanikian seated in front of a CT scanner, giving two thumbs up',
        blocks: [
          { t: 'p', lead: true, text: 'I could begin by saying, “I had breast cancer.” But that would be far too simple to tell everything this sentence contains.' },
          { t: 'p', text: 'My name is Carine. I am a woman, a mother, a professional, and a woman of faith.' },
          { t: 'p', text: 'Like many women, I thought I knew my body. I thought I also knew what I needed to do to take care of my health.' },
          { t: 'p', text: 'My mother had already had breast cancer. Today, I know that this family history should have led me to be more vigilant. But at the time, I didn’t know.' },
          { t: 'p', text: 'In my mind, it was simple: I would do my mammogram at 40. I didn’t know that with a family history of breast cancer, it can be necessary to speak with a doctor to assess your level of risk and adapt the screening. I was not sufficiently alert. And this is exactly the information I want to share today, because I know that another woman may also not know.' },
          { t: 'h', text: 'March 2022' },
          { t: 'p', text: 'I felt a lump in my left breast. I became worried. I consulted. I had medical examinations. And yet, nothing sufficiently concerning was identified at that time. So I continued my life. Because when you are reassured, you want to believe that everything is fine. The lump was still there, but in my mind, the danger moved away.' },
          { t: 'h', text: 'November 2023' },
          { t: 'p', text: 'The examinations, consultations, and investigations continued. And this time, the word came. Cancer. There are words that change a life. That one did.' },
          { t: 'p', text: 'I wondered if I was going to die. I thought about my children, my family, and everything I had not yet lived. I was afraid. Of course I was afraid. But in the midst of that fear, there was my faith. I chose to hold on to God.' },
          { t: 'quote', text: '“I will not die but live, and I will proclaim what the Lord has done.”', by: 'This verse became my refuge.' },
          { t: 'list', title: 'Then the fight began.', items: ['Chemotherapy.', 'Infusions.', 'Sessions.', 'Waiting.', 'Exhaustion.'] },
          { t: 'p', text: 'There were days when my body reminded me that I was sick. Days when I had to find the strength to return for treatment even though I already knew how I would feel afterwards.' },
          { t: 'quote', text: 'Chemotherapy taught me one thing: You can be terrified and courageous at the same time.' },
          { t: 'p', text: 'Courage is not the absence of trembling. Courage is moving forward while you tremble.' },
          { t: 'list', items: ['Fear.', 'Faith.', 'Treatment.', 'Resilience.', 'Life.'], title: 'This is part of my story.' },
        ],
      },
      {
        id: 'carine-stronger', page: '04', kicker: 'From survival to purpose', title: 'A Stronger Me Today',
        art: 2, artAlt: 'Tropik Magazine page 04: Carine Nanikian in a pink blazer, smiling with her hand at her temple',
        blocks: [
          { t: 'quote', text: 'What I went through did not break me, it revealed a stronger version of me.' },
          { t: 'p', lead: true, text: 'After months of chemotherapy, surgery and radiotherapy, I reached the end of my active treatments. Many people think that when treatments end, the story ends. But the reality is very different. That was the beginning of another chapter — the chapter of rebuilding my life.' },
          { t: 'p', text: 'The physical side effects were real. The fatigue, the pain, the lymphoedema, the changes in my body and the emotional ups and downs were part of this new reality. There were days when I felt strong, and days when I felt overwhelmed. I had to learn to be patient with myself, to accept my new body and to give myself the time to heal.' },
          { t: 'quote', text: 'You can be afraid and courageous at the same time.' },
          { t: 'p', text: 'Courage is not the absence of fear. Courage is moving forward while you tremble.' },
          { t: 'h', text: 'Learning to live again' },
          { t: 'p', text: 'Life after cancer is a journey of adaptation. I had to relearn my body, rebuild my confidence and slowly return to the life I love. I wanted to laugh again, to be a mother fully present for my children, to travel, to work, to embrace every opportunity and to be simply Carine. It was not always easy, but each small step forward was a victory.' },
          { t: 'p', text: 'This experience taught me to appreciate life differently. I became more aware, more grateful and more focused on what truly matters. I understood that time is not something we own, and that our health is a precious gift that we must never take for granted.' },
          { t: 'h', text: 'A new mission' },
          { t: 'p', text: 'My journey gave birth to a purpose: to use my story to support, inform and encourage other women. Today, through Espoir Pour Elles, I am committed to raising awareness about breast cancer, to promoting early detection and to reminding every woman that she is not alone.' },
          { t: 'h', text: 'My message to you' },
          { t: 'p', text: 'To every woman who is facing this journey: you are stronger than you think. You are not alone. There is hope, there is life after treatment, and there is a future full of possibilities.' },
          { t: 'quote', text: 'I am still here to tell my story, because it may help another woman to choose life.' },
          { t: 'callout', title: 'For all women — Your health matters.', text: [
            'If you have a family history of breast cancer, talk to your doctor about your individual risk and the appropriate screening plan. If you feel a lump or notice any unusual change in your breast, do not ignore it. Consult, even if a first examination is reassuring. Persist and ask for a re-evaluation if the anomaly remains. Early detection can make a real difference.',
            'Know your family history · Listen to your body · Do not ignore any change · Consult a healthcare professional · Get screened',
            '“Early detection can save a life. Your story can continue too.”',
          ] },
        ],
      },
    ],
  },
  {
    slug: 'rozina-negusei', edition: 'Special Edition · Dubai 2025 · The One Movement', tags: 'People · Ideas · Opportunities · A Stronger Africa',
    name: 'Rozina Negusei', headline: 'Building bridges between Africa, business and global influence.',
    deck: 'Entrepreneur. Producer. Investor. Global African Voice.', accent: 'gold',
    chapters: [
      {
        id: 'rozina-leadership', page: '02', kicker: 'Leadership beyond borders', title: 'Rozina Negusei', deck: 'Building Bridges Between Africa, Business and Global Influence',
        art: 9, artAlt: 'Tropik Magazine page 02: Rozina Negusei in conversation, and a portrait captioned A woman of vision and impact',
        caption: ['Rozina Negusei in discussion with leaders and partners to explore new opportunities for African talent, investment and sustainable growth.'],
        blocks: [
          { t: 'p', lead: true, text: 'Rozina Negusei is part of a new generation of African leaders who are shaping the future through creativity, business and meaningful global connections. Her journey is a powerful example of how talent, vision and purpose can create real opportunities — not only for individuals, but for entire communities.' },
          { t: 'h', text: 'From Ethiopia to the world' },
          { t: 'p', text: 'Born from Ethiopian heritage and shaped by a global perspective, Rozina Negusei has built a career that connects entertainment, fashion, media and investment. Her work reflects a deep belief in the potential of Africa and its diaspora, and the importance of creating platforms that empower the next generation.' },
          { t: 'p', text: 'With a strong academic background in business and a passion for the creative industries, she began her career in entertainment, working in casting and production before founding Zanar Entertainment. She later expanded her activities into music, fashion and investment, creating En-Treeg Records, co-founding Rasjudah Clothing, and developing En-Treeg Investment Group.' },
          { t: 'quote', text: '“Real change happens when people connect, share ideas and invest in the future together.”', by: 'Rozina Negusei' },
          { t: 'h', text: 'Entertainment as a catalyst' },
          { t: 'p', text: 'For Rozina, entertainment is more than the spotlight — it is a powerful ecosystem that creates jobs, develops talent and opens doors to wider economic opportunities.' },
          { t: 'p', text: 'Through Zanar Entertainment, she was involved in the production of the film Chocolate City, demonstrating her ability to move from talent development to full-scale production and international projects.' },
          { t: 'h', text: 'Investing in Africa’s potential' },
          { t: 'p', text: 'Rozina Negusei has been actively involved in investment initiatives across Africa, including a high-profile visit to Uganda, where she discussed plans for a $12 million investment in the entertainment sector.' },
          { t: 'p', text: 'Her work in Africa is guided by a clear vision: to identify opportunities, support local talent and contribute to long-term development.' },
          { t: 'quote', text: '“When you develop an artist, you develop a nation.”', by: 'Rozina Negusei' },
          { t: 'h', text: 'A global African leader' },
          { t: 'p', text: 'Today, Rozina is recognized as an entrepreneur, producer, investor and influential voice for Africa. Her work bridges markets, connects people and creates opportunities across the continent and the diaspora. Through her companies and philanthropic initiatives, she continues to support creative industries, invest in African talent and promote sustainable growth.' },
          { t: 'p', text: 'Her journey is a reminder that African influence is not limited by borders — it is global, dynamic and full of possibility.' },
        ],
      },
      {
        id: 'rozina-partnerships', page: '03', kicker: 'Investment, Talent. Opportunity. A Shared Future.', title: 'A Stronger Africa Through Partnerships',
        art: 5, artAlt: 'Tropik Magazine page 03: Rozina Negusei with President Yoweri Kaguta Museveni, and with Akon in Uganda',
        caption: ['Rozina Negusei with President Yoweri Kaguta Museveni during her investment visit to Uganda.', 'Rozina Negusei with Akon during her visit to Uganda.'],
        blocks: [
          { t: 'p', lead: true, text: 'In 2021, Rozina Negusei travelled to Uganda to explore investment opportunities in the country’s entertainment sector. During her visit, she met with President Yoweri Kaguta Museveni and discussed plans for a significant investment, with reports at the time describing a proposed investment of approximately $12 million.' },
          { t: 'p', text: 'The significance of this move goes beyond the figure itself. It reflects a clear philosophy: African talent should not only be consumed globally, but developed, financed and given the infrastructure necessary to compete globally.' },
          { t: 'quote', text: '“African talent should not only be consumed globally. It should be developed, financed and given the infrastructure to compete globally.”', by: 'Rozina Negusei' },
          { t: 'h', text: 'A shared vision' },
          { t: 'p', text: 'Rozina Negusei is also widely known as the wife of Akon, the global music entrepreneur and philanthropist. Together, they represent a powerful alliance between entertainment, entrepreneurship and African development.' },
          { t: 'p', text: 'Akon’s career has evolved from global music success into entrepreneurship and Africa-focused initiatives, including Akon Lighting Africa and other ventures designed to connect international resources, technology, entertainment and African markets.' },
          { t: 'list', items: ['Investing in people.', 'Creating opportunities.', 'A stronger Africa.'] },
        ],
      },
      {
        id: 'rozina-giving-back', page: '05', kicker: 'Compassion in Action. Impact for Generations.', title: 'Giving Back: A Stronger Africa',
        art: 1, artAlt: 'Tropik Magazine page 05: Rozina Negusei and Akon during a donation to local communities in Uganda',
        caption: ['Rozina Negusei and Akon during a donation to support local communities in Uganda.'],
        blocks: [
          { t: 'p', lead: true, text: 'Africa’s strength lies in its people. Beyond fashion, business and entertainment, Rozina Negusei and her husband, global music entrepreneur Akon, continue to demonstrate that real success is measured by the lives we touch.' },
          { t: 'p', text: 'During a visit to Uganda, they made a donation to support local communities — a gesture that reflects their shared belief in dignity, opportunity and a brighter future for Africa. This moment is a reminder that partnerships, influence and resources can and should be used to create lasting change.' },
          { t: 'p', text: 'Through initiatives like these, Rozina Negusei and Akon amplify a powerful message: Africa rises when we invest in its people.' },
          { t: 'quote', text: '“A stronger Africa is built through education, opportunity and compassion.”', by: 'Rozina Negusei' },
          { t: 'h', text: 'People. Solidarity. A brighter tomorrow.' },
          { t: 'p', text: 'This act of giving is part of a broader commitment to support education, youth empowerment and community development across Africa. By standing with local communities, Rozina Negusei and Akon continue to inspire a new generation — one that believes in the power of unity, generosity and shared prosperity.' },
          { t: 'quote', text: 'Together, we can create more opportunities and a stronger, more united Africa.' },
          { t: 'p', text: 'Real change happens when we care, act and invest in people.' },
        ],
      },
    ],
  },
  {
    slug: 'reischca-kazumba', edition: 'The One Fashion Week International · Dubai 2026', tags: 'Fashion · Culture · Creation · Influence',
    name: 'Reischca Kazumba', headline: 'The Congolese designer bringing Afro-contemporary elegance to The One Fashion Week International Dubai 2026.',
    deck: 'Founder and creative director of Kazur Fashion.', accent: 'night',
    chapters: [
      {
        id: 'reischca-designer', page: '—', kicker: 'Fashion · Culture · Creation · Influence', title: 'Presence, storytelling and legacy',
        art: 3, artAlt: 'Tropik Magazine page: Reischca Kazumba in a cream structured jacket holding a tailor’s measuring tape',
        blocks: [
          { t: 'p', lead: true, text: 'In a fashion landscape increasingly searching for authenticity, cultural depth and distinctive creative voices, Reischca Kazumba represents a new generation of African designers redefining luxury through identity, structure and contemporary elegance.' },
          { t: 'p', text: 'Founder and creative director of Kazur Fashion, the Congolese designer has built a creative universe where African heritage meets refined modern craftsmanship. Her work is not rooted in costume or decorative interpretation of culture, but in the transformation of African references into sophisticated contemporary fashion capable of existing naturally on international runways, in luxury spaces and within modern global fashion conversations.' },
          { t: 'quote', text: 'For Reischca, fashion is not simply about clothing. It is about presence, storytelling and legacy.' },
        ],
      },
    ],
  },
];

export const COVERS = [
  { n: 12, name: 'Carine Nanikian', note: 'October Pink 2026' },
  { n: 14, name: 'Rozina Negusei', note: 'Special Edition' },
  { n: 13, name: 'Reischca Kazumba', note: 'Fashion' },
  { n: 4, name: 'Zaituni', note: 'Cover' },
  { n: 6, name: 'Kate', note: 'Cover' },
  { n: 8, name: 'Mahammed', note: 'Cover' },
  { n: 15, name: 'Angie', note: 'Cover' },
  { n: 16, name: 'Abdoul Primo', note: 'Cover' },
];

/* ---------------- Media kit 2026 (10 pages) ---------------- */
export const KIT = {
  stats: [
    { v: '5+', l: 'Editions produced' },
    { v: '20+', l: 'Countries of distribution' },
    { v: '20,000+', l: 'Printed copies' },
    { v: '1.4M+', l: 'Monthly digital views' },
  ],
  reach: [
    { k: 'Print', v: '20,000+ copies distributed across 20+ countries.' },
    { k: 'Digital', v: 'Editorial features on TropikAgency.com, 1.4M+ monthly views.' },
    { k: 'Social', v: 'Amplification across Instagram and Facebook.' },
    { k: 'Partner media', v: 'Onward distribution through partner media platforms.' },
  ],
  placed: ['Hotels and luxury spaces', 'Salons and lifestyle venues', 'Events and fashion shows', 'Partner locations in multiple countries'],
  channels: [
    { k: 'Print', v: 'The premium physical publication, distributed internationally.' },
    { k: 'Digital', v: 'Editorial features published on TropikAgency.com and online visibility.' },
    { k: 'Social', v: 'Amplification across Instagram and Facebook.' },
    { k: 'Content', v: 'Articles, interviews and storytelling produced to editorial standard.' },
    { k: 'Podcast', v: 'Interview opportunities, where included in the agreed scope.' },
    { k: 'Video', v: 'Short-form promotional and storytelling content, where included.' },
  ],
  reasons: [
    { k: 'Global visibility', v: 'Reach audiences beyond a single market, in print and digital simultaneously.' },
    { k: 'Brand positioning', v: 'Position individuals, organisations and institutions through premium storytelling rather than advertising.' },
    { k: 'Editorial storytelling', v: 'Transform achievements, projects and missions into narratives an international reader will finish.' },
    { k: 'Multi-platform exposure', v: 'Print, digital, social and partner media, from a single editorial partnership.' },
    { k: 'African & international perspective', v: 'Connect African stories, talent and opportunities with international audiences — a vantage point few international titles hold.' },
  ],
  premium: [
    { k: 'One page', price: 'USD 3,000', alloc: '100', items: ['1 premium editorial page', 'Digital publication', 'Social media promotion', 'International distribution'] },
    { k: 'Two pages', price: 'USD 5,000', alloc: '200', items: ['2 premium editorial pages', 'Digital publication', 'Social media promotion', 'Enhanced storytelling'] },
    { k: 'Three pages', price: 'USD 10,000', alloc: '300', items: ['3 premium editorial pages', 'Premium editorial storytelling', 'Digital publication', 'Social media promotion', 'Enhanced visibility'] },
  ],
  signatureElements: ['Multi-page editorial feature', 'Institutional interview', 'Leadership profile', 'Special editorial section', 'Digital amplification', 'Social media visibility', 'Printed copies for institutional distribution', 'Customised storytelling', 'Potential event and editorial integration'],
  institutionsCommunicate: ['Cultural initiatives and heritage', 'Investment opportunities', 'Tourism and destination positioning', 'Economic development programmes', 'Entrepreneurship and youth initiatives', 'International cooperation', 'National achievements', 'Institutional leadership', 'African excellence on a global stage'],
  coverBenefits: ['Front and exterior cover positioning', 'Premium editorial story', 'Digital feature', 'Social media amplification', 'International distribution', 'Customised editorial treatment'],
};
