/** Editorial snapshot checked against the UAE Cabinet and Forbes Middle East on 16 October 2026. */
export type EmiratesPerson = {
  slug: string; name: string; role: string; wiki?: string;
  source: string; wealth?: string; family?: boolean;
};
const council = "https://uaecabinet.ae/en/federal-supreme-council";
const cabinet = "https://uaecabinet.ae/en/cabinet-members";
const forbes = "https://www.forbesmiddleeast.com/lists/the-worlds-richest-arabs-2026/";
export const UAE_RULERS: EmiratesPerson[] = [
  { slug: "mohamed-bin-zayed", name: "Sheikh Mohamed bin Zayed Al Nahyan", role: "President of the UAE · Ruler of Abu Dhabi", wiki: "Mohamed_bin_Zayed_Al_Nahyan", source: council },
  { slug: "mohammed-bin-rashid", name: "Sheikh Mohammed bin Rashid Al Maktoum", role: "Vice President · Prime Minister · Ruler of Dubai", wiki: "Mohammed_bin_Rashid_Al_Maktoum", source: council },
  { slug: "sultan-al-qasimi", name: "Sheikh Dr Sultan bin Mohammed Al Qasimi", role: "Ruler of Sharjah", wiki: "Sultan_bin_Muhammad_Al-Qasimi", source: council },
  { slug: "humaid-al-nuaimi", name: "Sheikh Humaid bin Rashid Al Nuaimi", role: "Ruler of Ajman", wiki: "Humaid_bin_Rashid_Al_Nuaimi", source: council },
  { slug: "saud-al-mualla", name: "Sheikh Saud bin Rashid Al Mualla", role: "Ruler of Umm Al Quwain", wiki: "Saud_bin_Rashid_Al_Mualla", source: council },
  { slug: "saud-al-qasimi", name: "Sheikh Saud bin Saqr Al Qasimi", role: "Ruler of Ras Al Khaimah", wiki: "Saud_bin_Saqr_Al_Qasimi", source: council },
  { slug: "hamad-al-sharqi", name: "Sheikh Hamad bin Mohammed Al Sharqi", role: "Ruler of Fujairah", wiki: "Hamad_bin_Mohammed_Al_Sharqi", source: council },
];
export const UAE_CABINET: EmiratesPerson[] = [
  { ...UAE_RULERS[1]!, source: cabinet },
  { slug: "mansour-bin-zayed", name: "Sheikh Mansour bin Zayed Al Nahyan", role: "Vice President · Deputy Prime Minister · Chairman of the Presidential Court", wiki: "Mansour_bin_Zayed_Al_Nahyan", source: cabinet },
  { slug: "hamdan-bin-mohammed", name: "Sheikh Hamdan bin Mohammed bin Rashid Al Maktoum", role: "Crown Prince of Dubai · Deputy Prime Minister · Minister of Defence", wiki: "Hamdan_bin_Mohammed_Al_Maktoum", source: cabinet },
  { slug: "maktoum-bin-mohammed", name: "Sheikh Maktoum bin Mohammed bin Rashid Al Maktoum", role: "First Deputy Ruler of Dubai · Deputy Prime Minister · Minister of Finance", wiki: "Maktoum_bin_Mohammed_Al_Maktoum", source: cabinet },
  { slug: "saif-bin-zayed", name: "Sheikh Saif bin Zayed Al Nahyan", role: "Deputy Prime Minister · Minister of Interior", wiki: "Saif_bin_Zayed_Al_Nahyan", source: cabinet },
  { slug: "abdullah-bin-zayed", name: "Sheikh Abdullah bin Zayed Al Nahyan", role: "Deputy Prime Minister · Minister of Foreign Affairs", wiki: "Abdullah_bin_Zayed_Al_Nahyan", source: cabinet },
  { slug: "nahayan-bin-mabarak", name: "Sheikh Nahayan bin Mabarak Al Nahayan", role: "Minister of Tolerance and Coexistence", wiki: "Nahyan_bin_Mubarak_Al_Nahyan", source: cabinet },
  { slug: "mohammad-al-gergawi", name: "Mohammad bin Abdullah Al Gergawi", role: "Minister of Cabinet Affairs", wiki: "Mohammad_Al_Gergawi", source: cabinet },
  { slug: "abdulrahman-al-owais", name: "Abdulrahman bin Mohamed Al Owais", role: "Minister of Federal National Council Affairs", wiki: "Abdul_Rahman_Mohammed_Al_Owais", source: cabinet },
  { slug: "mohamed-al-hussaini", name: "Mohamed bin Hadi Al Hussaini", role: "Minister of State for Financial Affairs", source: cabinet },
  { slug: "reem-al-hashimy", name: "Reem bint Ebrahim Al Hashimy", role: "Minister of State for International Cooperation", wiki: "Reem_Al_Hashimy", source: cabinet },
  { slug: "suhail-al-mazrouei", name: "Suhail Mohamed Al Mazrouei", role: "Minister of Energy and Infrastructure", wiki: "Suhail_Al_Mazroui", source: cabinet },
  { slug: "sultan-al-jaber", name: "Dr Sultan bin Ahmad Sultan Al Jaber", role: "Minister of Industry and Advanced Technology", wiki: "Sultan_Al_Jaber", source: cabinet },
  { slug: "ahmad-al-falasi", name: "Dr Ahmad bin Abdullah Belhoul Al Falasi", role: "Minister of Sports", wiki: "Ahmad_Belhoul_Al_Falasi", source: cabinet },
  { slug: "thani-al-zeyoudi", name: "Dr Thani bin Ahmed Al Zeyoudi", role: "Minister of Foreign Trade", wiki: "Thani_bin_Ahmed_Al_Zeyoudi", source: cabinet },
  { slug: "shamma-al-mazrui", name: "Shamma bint Sohail Al Mazrui", role: "Minister of Community Empowerment", wiki: "Shamma_Al_Mazrui", source: cabinet },
  { slug: "sarah-al-amiri", name: "Sarah bint Yousef Al Amiri", role: "Minister of Education", wiki: "Sarah_Al_Amiri", source: cabinet },
  { slug: "ahmed-al-sayegh", name: "Ahmed bin Ali Al Sayegh", role: "Minister of Health and Prevention", wiki: "Ahmed_Al_Sayegh", source: cabinet },
  { slug: "abdulla-al-marri", name: "Abdulla bin Touq Al Marri", role: "Minister of Economy and Tourism", wiki: "Abdulla_bin_Touq_Al_Marri", source: cabinet },
  { slug: "abdulrahman-al-awar", name: "Dr Abdulrahman bin Abdulmanan Al Awar", role: "Minister of Human Resources and Emiratisation · Acting Minister of Higher Education and Scientific Research", wiki: "Abdulrahman_Al_Awar", source: cabinet },
  { slug: "abdullah-al-nuaimi", name: "Abdullah bin Sultan bin Awad Al Nuaimi", role: "Minister of Justice", source: cabinet },
  { slug: "salem-al-qassimi", name: "Sheikh Salem bin Khalid Al Qassimi", role: "Minister of Culture", wiki: "Salem_bin_Khalid_Al_Qassimi", source: cabinet },
  { slug: "mohamed-alsuwaidi", name: "Mohamed bin Hassan Alsuwaidi", role: "Minister of Investment", wiki: "Mohamed_Hassan_Alsuwaidi", source: cabinet },
  { slug: "amna-al-dahak", name: "Dr Amna bint Abdullah Al Dahak Al Shamsi", role: "Minister of Climate Change and Environment", wiki: "Amna_Al_Dahak", source: cabinet },
  { slug: "sana-suhail", name: "Sana bint Mohamed Suhail", role: "Minister of Family", source: cabinet },
  { slug: "omar-al-olama", name: "Omar Sultan Al Olama", role: "Minister of State for Artificial Intelligence", wiki: "Omar_Al_Olama", source: cabinet },
  { slug: "maryam-al-hammadi", name: "Maryam bint Ahmed Al Hammadi", role: "Minister of State · Secretary General of the UAE Cabinet", wiki: "Maryam_Al_Hammadi", source: cabinet },
  { slug: "mohamed-al-mazrouei", name: "Mohamed bin Mubarak Fadhel Al Mazrouei", role: "Minister of State for Defense Affairs", source: cabinet },
];
/** All seven UAE entries in this edition; not a list of all private or royal wealth. */
export const UAE_BILLIONAIRES: EmiratesPerson[] = [
  { slug: "hussain-sajwani", name: "Hussain Sajwani", role: "Founder, DAMAC Properties", wiki: "Hussain_Sajwani", wealth: "15.3", source: `${forbes}hussain-sajwani/` },
  { slug: "abdulla-al-futtaim", name: "Abdulla Al Futtaim & family", role: "Al-Futtaim Group · automotive and retail", wiki: "Abdulla_Al_Futtaim", wealth: "4.8", family: true, source: `${forbes}abdulla-al-futtaim-family/` },
  { slug: "abdulla-al-ghurair", name: "Abdulla bin Ahmad Al Ghurair & family", role: "Founder, Mashreqbank · diversified business", wiki: "Abdulla_bin_Ahmad_Al_Ghurair", wealth: "4.5", family: true, source: `${forbes}abdulla-bin-ahmad-al-ghurair-family/` },
  { slug: "waleed-al-zaabi", name: "Waleed Mohammad Al Zaabi", role: "Founder, Tiger Group", wiki: "Waleed_Mohammad_Al_Zaabi", wealth: "3.4", source: `${forbes}waleed-mohammad-al-zaabi/` },
  { slug: "mohamed-alabbar", name: "Mohamed Alabbar", role: "Founder, Emaar · Americana Restaurants", wiki: "Mohamed_Alabbar", wealth: "3.0", source: `${forbes}mohamed-alabbar/` },
  { slug: "hussain-binghatti", name: "Hussain Binghatti Aljbori", role: "Founder, Binghatti Properties", wealth: "2.5", source: `${forbes}hussain-binghatti-aljbori/` },
  { slug: "abbas-sajwani", name: "Abbas Sajwani", role: "Founder, AHS Properties", wiki: "Abbas_Sajwani", wealth: "1.9", source: `${forbes}abbas-sajwani/` },
];
