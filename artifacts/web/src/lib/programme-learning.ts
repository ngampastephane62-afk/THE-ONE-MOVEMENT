export interface ProgrammeTopic {
  id: string;
  title: string;
  question: string;
  intro: string;
  resource: { title: string; publisher: string; url: string; format: string };
  prompts: string[];
  tags: string[];
}

/** Original introductory notes and questions; linked collections remain with their publishers. */
export const PROGRAMME_TOPICS: ProgrammeTopic[] = [
  {
    id: 'visual-language', title: 'Graphic design & cultural signs',
    question: 'What can a sign communicate before a single word is spoken?',
    intro: 'A pattern, letterform or colour can carry a story about place, belonging and power. Meaning changes between communities: the same sign may be decorative in one setting and sacred in another. Study who made an image, who uses it and what permission its reuse requires before turning it into a logo, print or campaign.',
    resource: { title: 'Cooper Hewitt design collection', publisher: 'Smithsonian', url: 'https://www.si.edu/collections/cooper-hewitt', format: 'Design collection' },
    prompts: ['Choose one everyday sign and explain its meaning in your community.', 'Compare two designs without assuming that similar shapes share an origin.', 'Ask a designer or cultural custodian what should not be reproduced.'],
    tags: ['Graphic design', 'Symbols', 'Identity'],
  },
  {
    id: 'objects-heritage', title: 'Sculpture, rare objects & living heritage',
    question: 'Whose story does an object tell — and who gets to tell it?',
    intro: 'A statue, vessel or textile is more than its appearance. Materials, maker, purpose and the circumstances of its collection help explain its history. Museum descriptions are useful starting points, not the only authority: living communities may hold knowledge, restrictions or claims absent from a catalogue. Distinguish an object’s documented provenance from a story imagined around it.',
    resource: { title: 'Explore The Met collection', publisher: 'The Metropolitan Museum of Art', url: 'https://www.metmuseum.org/art/collection', format: 'Art and object collection' },
    prompts: ['Read one object record and identify what is known and what is uncertain.', 'Describe the knowledge a maker would need to produce it.', 'Consider how you would credit or consult its originating community.'],
    tags: ['Sculpture', 'Craft', 'Provenance'],
  },
  {
    id: 'landscapes-flora', title: 'Mountains, flora & cultural landscapes',
    question: 'How does a landscape influence what a community makes?',
    intro: 'Mountains, water, climate and plants influence materials, food, colours and daily practice. A plant may connect botany with textile dyes, medicine, farming and storytelling, but scientific identification and cultural meaning are different kinds of knowledge. Explore both without treating a traditional use as proof of medical safety or a landscape as an empty resource.',
    resource: { title: 'Plants of the World Online', publisher: 'Royal Botanic Gardens, Kew', url: 'https://powo.science.kew.org/', format: 'Botanical reference' },
    prompts: ['Identify a plant connected to a local craft and check its scientific name.', 'Ask how season or altitude changes a material’s availability.', 'Discuss conservation and community rights before proposing a product.'],
    tags: ['Nature', 'Botany', 'Landscapes'],
  },
  {
    id: 'antiquity-myth', title: 'Antiquity, mythology & collective memory',
    question: 'What is evidence, what is interpretation and what is a myth?',
    intro: 'Ancient objects and texts provide evidence of how people lived, while mythology reveals how communities explained existence, responsibility and the unknown. A myth is not a scientific account, and a modern retelling is not automatically an ancient belief. Comparing versions, dates and sources helps us appreciate stories without flattening distinct traditions into one universal narrative.',
    resource: { title: 'Mythology: an introduction', publisher: 'World History Encyclopedia', url: 'https://www.worldhistory.org/mythology/', format: 'Historical introduction' },
    prompts: ['Compare two versions of a story and name their sources.', 'Separate an archaeological observation from your interpretation.', 'Discuss what changes when a myth becomes fashion, film or fiction.'],
    tags: ['Antiquity', 'Mythology', 'History'],
  },
  {
    id: 'fashion-craft', title: 'Fashion, textiles & the knowledge of making',
    question: 'What would we learn if the maker explained the collection?',
    intro: 'A collection can express identity through construction, materials, silhouette and technique, not only through spectacle. Learning from a designer means asking how something is made, what its references mean and who contributes to the work. Heritage is living and changing; no single collection can represent an entire country or continent.',
    resource: { title: 'Fashion stories and collections', publisher: 'Google Arts & Culture', url: 'https://artsandculture.google.com/project/fashion', format: 'Visual stories' },
    prompts: ['Ask a designer to explain one technique step by step.', 'Trace one material from its origin to the finished garment.', 'Credit makers, cultural references and collaborators in a collection note.'],
    tags: ['Fashion', 'Textiles', 'Heritage'],
  },
  {
    id: 'music-dance', title: 'Music, dance & peaceful coexistence',
    question: 'How can performance become a conversation rather than a display?',
    intro: 'Music and dance carry language, memory, celebration and social relationships. Watching a performance is only a beginning: listening to practitioners helps us understand context, changes and boundaries. Cultural exchange should allow people to explain themselves, choose how they participate and receive appropriate credit, rather than being asked to perform a simplified idea of their identity.',
    resource: { title: 'Explore living heritage', publisher: 'UNESCO Intangible Cultural Heritage', url: 'https://ich.unesco.org/en/lists', format: 'Heritage records' },
    prompts: ['Invite a practitioner to explain a rhythm, movement or instrument.', 'Ask what consent is needed before recording or sharing.', 'Discuss how a collaboration can preserve each contributor’s voice.'],
    tags: ['Music', 'Dance', 'Living heritage'],
  },
  {
    id: 'fiction-literature', title: 'Literature, fiction & possible futures',
    question: 'What can an imagined world help us ask about the real one?',
    intro: 'Fiction can make unfamiliar perspectives easier to encounter and let us test possible futures without claiming they have happened. Reading across cultures requires attention to author, translation and historical context. An imagined narrative can inspire a collection or a conversation, but it should remain clearly distinct from historical evidence, a scientific forecast or a community’s own testimony.',
    resource: { title: 'Read literature online', publisher: 'Project Gutenberg', url: 'https://www.gutenberg.org/', format: 'Digital book library' },
    prompts: ['Read a short work and explain one assumption it challenges.', 'Compare how a translation presents a culturally specific word.', 'Write a brief imagined future and label it as fiction; check local copyright rules before reuse.'],
    tags: ['Literature', 'Fiction', 'Imagination'],
  },
  {
    id: 'science-technology', title: 'Science, new technology & better questions',
    question: 'How do we tell a useful demonstration from an unsupported claim?',
    intro: 'Science develops through observation, explanation, testing and revision. New technology connects that knowledge to practical choices, but a striking demonstration is not the same as reliable evidence at scale. Ask what was measured, under which conditions and with what limitations. People from creative and technical fields can learn together without needing to pretend they already know every answer.',
    resource: { title: 'Learn science with NASA', publisher: 'NASA Science', url: 'https://science.nasa.gov/learn/', format: 'Science learning resources' },
    prompts: ['Explain one scientific idea in language a beginner can understand.', 'Identify a measurement that could test a technology claim.', 'Ask which uncertainties or accessibility needs a prototype leaves unresolved.'],
    tags: ['Science', 'Technology', 'Evidence'],
  },
  {
    id: 'health-medicine', title: 'Modern medicine & public understanding',
    question: 'How can better health information help a community?',
    intro: 'Health literacy includes understanding risks, recognising reliable sources and knowing when professional advice is needed. Research, public-health guidance and an individual diagnosis serve different purposes. Conversations can connect clinicians, researchers, designers and communicators, but educational material and personal stories must not be presented as diagnosis, treatment or proof that a product is safe.',
    resource: { title: 'Explore health topics', publisher: 'World Health Organization', url: 'https://www.who.int/health-topics', format: 'Health reference' },
    prompts: ['Check the source and date of a health claim before sharing it.', 'Ask a qualified practitioner how to communicate uncertainty.', 'Discuss accessible design without giving personal medical advice.'],
    tags: ['Medicine', 'Health literacy', 'Research'],
  },
  {
    id: 'materials-mining', title: 'Raw materials, mining & responsible creation',
    question: 'What connects a mineral to a phone, a building or a piece of jewellery?',
    intro: 'Minerals link geology to technology, infrastructure and creative industries. Understanding a material also means considering extraction, labour, environmental impact, traceability and reuse. Geological knowledge does not establish ownership, authorise extraction or guarantee investment returns. Cross-sector discussion can help a maker ask better questions of a supplier and help a technical specialist understand a community’s concerns.',
    resource: { title: 'Mineral Resources Program', publisher: 'U.S. Geological Survey', url: 'https://www.usgs.gov/programs/mineral-resources-program', format: 'Scientific reference' },
    prompts: ['Choose an everyday object and identify one mineral it needs.', 'Ask what evidence supports a supplier’s traceability statement.', 'Explore repair, recycling and community impacts before proposing extraction.'],
    tags: ['Mining', 'Materials', 'Responsibility'],
  },
  {
    id: 'media-storytelling', title: 'Media, storytelling & information literacy',
    question: 'What responsibility comes with making a story visible?',
    intro: 'A photograph, interview or short video can connect people across borders, but framing and editing shape what an audience understands. Separate verified information, opinion, advertising and fiction. Consent, accurate captions and source attribution matter as much as production quality, especially when reporting on people whose circumstances differ from our own.',
    resource: { title: 'Media and information literacy', publisher: 'UNESCO', url: 'https://www.unesco.org/en/media-information-literacy', format: 'Learning framework and resources' },
    prompts: ['Check the original context of an image before reposting it.', 'Rewrite a caption so that fact and interpretation are distinct.', 'Agree how an interviewee can understand the intended use of their words.'],
    tags: ['Media', 'Storytelling', 'Critical thinking'],
  },
  {
    id: 'diplomacy-coexistence', title: 'Diplomacy, dialogue & living together',
    question: 'How can people disagree without denying one another a place?',
    intro: 'Peaceful coexistence does not require identical beliefs or interests. It requires listening, respecting human dignity and making room for differences without harassment or exclusion. An introduction between communities can begin with a shared question or practical task. A cultural meeting is an opportunity for dialogue, not a claim to official diplomatic authority or a guarantee of political agreement.',
    resource: { title: 'Universal Declaration of Human Rights', publisher: 'United Nations', url: 'https://www.un.org/en/about-us/universal-declaration-of-human-rights', format: 'Foundational text' },
    prompts: ['Describe a point of disagreement without insulting the other person.', 'Ask each participant what outcome would make a dialogue useful.', 'Propose a small shared activity and make everyone’s consent explicit.'],
    tags: ['Diplomacy', 'Human dignity', 'Cooperation'],
  },
  {
    id: 'business-investment', title: 'Business, investment & useful connections',
    question: 'What does the other person actually need from your network?',
    intro: 'A useful connection begins with a specific need, a relevant skill and permission to make an introduction. It is not measured only by the number of contacts someone has. Business and investment discussions also need clear risks, responsibilities and written terms. Educational material does not recommend a transaction, promise success or turn a conversation into an investment agreement.',
    resource: { title: 'Introduction to investing', publisher: 'Investor.gov · U.S. Securities and Exchange Commission', url: 'https://www.investor.gov/introduction-investing', format: 'Investor education' },
    prompts: ['Write one clear sentence about what you can offer and what you need.', 'Ask permission before sharing another person’s contact details.', 'Identify a risk and a question to resolve before committing money.'],
    tags: ['Business', 'Investment', 'Introductions'],
  },
  {
    id: 'journeys-motivation', title: 'Journeys, motivation & definitions of success',
    question: 'What can a documented life teach us beyond its achievements?',
    intro: 'A success story becomes more useful when we examine its context, setbacks, collaborators and practical choices rather than treating achievement as a formula. Wangari Maathai’s documented biography offers a starting point for discussing education, environmental work and civic participation. Her example is a learning reference, not a TOMI endorsement or a promise that someone else will obtain the same results.',
    resource: { title: 'Wangari Maathai: biographical account', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/peace/2004/maathai/biographical/', format: 'Documented biography' },
    prompts: ['Identify one skill or habit you could practise rather than copy a result.', 'Name the collaborators and conditions that a simple success narrative overlooks.', 'Describe what a meaningful next step would look like in your own circumstances.'],
    tags: ['Motivation', 'Biography', 'Learning from experience'],
  },
];

const PROGRAMME_TOPIC_IDS: Record<string, readonly string[]> = {
  'diplomatic-gala': ['objects-heritage', 'antiquity-myth', 'diplomacy-coexistence', 'music-dance', 'landscapes-flora'],
  'fashion-week': ['visual-language', 'fashion-craft', 'objects-heritage', 'landscapes-flora', 'media-storytelling'],
  summit: ['science-technology', 'materials-mining', 'health-medicine', 'business-investment', 'journeys-motivation'],
  awards: ['journeys-motivation', 'fiction-literature', 'music-dance', 'media-storytelling'],
  'fashion-night': ['fashion-craft', 'music-dance', 'visual-language', 'objects-heritage'],
  'investment-forum': ['business-investment', 'materials-mining', 'science-technology', 'diplomacy-coexistence'],
};

/** Relevant starting points only: every programme still offers the full cross-sector collection. */
export function programmeTopicIds(slug: string): readonly string[] {
  return PROGRAMME_TOPIC_IDS[slug] ?? ['objects-heritage', 'science-technology', 'diplomacy-coexistence'];
}
