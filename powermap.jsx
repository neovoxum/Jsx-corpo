import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg: "#faf8f4", grid: "#e8e4dc", text: "#2a2420",
  dem: "#4a7ab5", rep: "#b54a4a", mix: "#b58a2a",
  state: "#6a8a6a", apex: "#7a5aa0", pharma: "#c0604a",
  media: "#4a8aa0", food: "#7a9a4a", tech: "#4a6ab5",
  research: "#8a6a4a", political: "#a04a7a", person: "#2a6a6a",
  tobacco: "#8a5a2a", alcohol: "#6a4a8a", chemical: "#a06a2a",
  military: "#4a6a4a", finance: "#2a4a8a",
};

const SEC_COLOR = {
  apex: P.apex, sovereign: P.state, energy: "#c07030", resources: "#508050",
  fiscal: P.finance, commerce: P.tech, realestate: "#608080",
  media: P.media, food: P.food, pharma: P.pharma, research: P.research,
  political: P.political, person: P.person, tobacco: P.tobacco,
  alcohol: P.alcohol, chemical: P.chemical, military: P.military,
  consumer: "#808050", intelligence: "#604040",
};

const PARTY = {
  dem: "Dem-leaning", rep: "Rep-leaning", mix: "Mixed/Both",
  state: "State/Foreign", apex: "Apex Layer", none: "Non-partisan",
};

// ── SOURCES ───────────────────────────────────────────────────────────────────
const SOURCES = [
  { title: "OpenSecrets — Corporate Political Donations", url: "https://www.opensecrets.org" },
  { title: "SEC 13F Filings — Institutional Holdings", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=13F" },
  { title: "BlackRock 2024 Annual Report", url: "https://ir.blackrock.com/financial-information/annual-reports" },
  { title: "Vanguard Group — Fund Holdings", url: "https://investor.vanguard.com/corporate-portal/" },
  { title: "Forbes Billionaires List 2024", url: "https://www.forbes.com/billionaires/" },
  { title: "Koch Industries — Subsidiary Overview", url: "https://www.kochind.com/companies" },
  { title: "PRRI American Values Atlas — Political Donations by Race", url: "https://www.prri.org/research/2023-american-values-atlas/" },
  { title: "In-Q-Tel Portfolio Companies", url: "https://www.iqt.org/portfolio/" },
  { title: "NIH Research Funding Database", url: "https://reporter.nih.gov/" },
  { title: "Gates Foundation Grantee Database", url: "https://www.gatesfoundation.org/about/committed-grants" },
  { title: "SPLC Financial Disclosures", url: "https://www.splcenter.org/about/financials" },
  { title: "AIPAC Lobbying Disclosures", url: "https://lda.senate.gov/system/public/" },
  { title: "Sovereign Wealth Fund Institute Rankings", url: "https://www.swfinstitute.org/fund-rankings/sovereign-wealth-fund" },
  { title: "UNODC — Drug Precursor Chemical Supply Chains", url: "https://www.unodc.org/unodc/en/drug-trafficking/index.html" },
  { title: "DEA — Fentanyl and Chinese Precursor Chemicals", url: "https://www.dea.gov/resources/facts-about-fentanyl" },
  { title: "Congressional Research Service — InQTel CIA Venture Capital", url: "https://crsreports.congress.gov" },
  { title: "Revolving Door Project — Government/Corporate Links", url: "https://therevolvingdoorproject.org" },
  { title: "Sinaloa Cartel — DOJ Indictment Records", url: "https://www.justice.gov/dea/press-releases" },
  { title: "WHO — Pharmaceutical Market Concentration", url: "https://www.who.int/publications/i/item/9789240004LLED" },
  { title: "Media Ownership Monitor", url: "https://www.reporter-ohne-grenzen.de/en/" },
  { title: "Brookfield Asset Management — Portfolio", url: "https://www.brookfield.com/our-businesses" },
  { title: "Carlyle Group — Portfolio Companies", url: "https://www.carlyle.com/our-business/portfolio" },
  { title: "Rio Tinto-Glencore Merger Reports 2025", url: "https://www.mining.com" },
  { title: "Federal Reserve Ownership Structure", url: "https://www.federalreserve.gov/faqs/about_14986.htm" },
  { title: "Wellcome Trust Annual Report", url: "https://wellcome.org/reports/wellcome-trust-annual-report-2023" },
];

// ── NODE DATA ─────────────────────────────────────────────────────────────────
const RAW_NODES = [
  // APEX INSTITUTIONAL
  {id:"vanguard",l:"Vanguard",s:"apex",r:30,c:P.apex,p:"apex",info:"$9T AUM. Mutual structure — no political donations. ~9% of BlackRock. Dominant stakes across all US industries simultaneously."},
  {id:"blackrock",l:"BlackRock",s:"apex",r:28,c:P.dem,p:"dem",info:"$10T AUM. Dem-leaning PAC donations 2024. Partially owned by Temasek (Singapore govt). Holds 7-9% of Apple, Microsoft, Pfizer, ExxonMobil, Disney simultaneously."},
  {id:"statestreet",l:"State Street",s:"apex",r:22,c:P.mix,p:"mix",info:"$4T AUM. Mixed R/D. Big Three asset manager. Dominant stakes in all major US corporations across every sector."},
  {id:"berkshire",l:"Berkshire Hathaway",s:"apex",r:25,c:P.mix,p:"mix",info:"Warren Buffett. Mixed R/D. Owns GEICO, BNSF Railway, BH Energy, Dairy Queen, Duracell, Fruit of the Loom, Pilot Flying J. $258B equity portfolio."},
  {id:"kkr",l:"KKR",s:"apex",r:18,c:P.rep,p:"rep",info:"$500B+ AUM. Lean-Rep. Private equity giant. Major holdings in media, healthcare, industrial. Henry Kravis co-founded. Invested in media companies globally."},
  {id:"apollo",l:"Apollo Global",s:"apex",r:18,c:P.rep,p:"rep",info:"$600B AUM. Lean-Rep. Leon Black founded. Private equity across media, insurance, tech, manufacturing. Owns Yahoo, ADT Security."},
  {id:"carlyle",l:"Carlyle Group",s:"apex",r:19,c:P.rep,p:"rep",info:"$400B AUM. Lean-Rep. Deep defense contractor holdings. Former SecDef Frank Carlucci chaired it. Revolving door with US govt. Aerospace, healthcare, consumer."},
  {id:"blackstone",l:"Blackstone",s:"apex",r:21,c:P.rep,p:"rep",info:"$1T+ AUM. Lean-Rep. World's largest alternative asset manager. Owns Hilton, SeaWorld, hospital systems, and vast rental housing portfolio."},

  // SOVEREIGN WEALTH
  {id:"norway",l:"Norway GPFG",s:"sovereign",r:20,c:P.state,p:"state",info:"$1.78T Norwegian state fund. No US donations. Holds shares in ~9,000 companies globally."},
  {id:"cic",l:"China CIC",s:"sovereign",r:17,c:P.state,p:"state",info:"$1.3T Chinese state sovereign fund. No US political donations. Invests in US infrastructure via intermediaries."},
  {id:"adia",l:"ADIA Abu Dhabi",s:"sovereign",r:17,c:P.state,p:"state",info:"$1.1T UAE sovereign fund. Co-invested $40B US data center deal with BlackRock 2025."},
  {id:"pif",l:"Saudi PIF",s:"sovereign",r:17,c:P.state,p:"state",info:"$925B Saudi state fund. Took EA private $55B. LIV Golf. Invests across US tech and entertainment."},
  {id:"temasek",l:"Temasek",s:"sovereign",r:15,c:P.state,p:"state",info:"Singapore govt. Largest BlackRock shareholder (~3.4%). US tech, biotech, luxury."},
  {id:"gic",l:"GIC Singapore",s:"sovereign",r:15,c:P.state,p:"state",info:"$850B Singapore fund. Co-invested in Anthropic (Claude). US real estate and private equity."},
  {id:"qia",l:"QIA Qatar",s:"sovereign",r:14,c:P.state,p:"state",info:"$530B Qatar fund. Co-invested in Anthropic. Owns Heathrow stake."},
  {id:"kiw",l:"Kuwait IWA",s:"sovereign",r:14,c:P.state,p:"state",info:"$1T Kuwait Investment Authority. One of oldest sovereign funds. US equities, real estate, infrastructure."},

  // BILLIONAIRES
  {id:"musk",l:"Elon Musk",s:"person",r:26,c:P.person,p:"rep",info:"~$300B net worth (2024). Owns Tesla, SpaceX, xAI, X (Twitter), Neuralink, The Boring Company. Donated $250M+ to Trump 2024. Heads DOGE advisory."},
  {id:"bezos",l:"Jeff Bezos",s:"person",r:25,c:P.person,p:"dem",info:"~$190B. Owns Amazon (founder), Blue Origin. Personal ownership of Washington Post. Mixed political donations."},
  {id:"gates",l:"Bill Gates",s:"person",r:24,c:P.person,p:"dem",info:"~$120B. Gates Foundation $75B endowment. Massive WHO funder, vaccine research, agriculture biotech via CGIAR."},
  {id:"zuckerberg",l:"Mark Zuckerberg",s:"person",r:23,c:P.person,p:"mix",info:"~$170B. Founder/CEO Meta. Holds 56.9% Meta voting power via Class B shares. Shifted toward Trump 2024. Chan Zuckerberg Initiative in research/education."},
  {id:"ellison",l:"Larry Ellison",s:"person",r:22,c:P.person,p:"rep",info:"~$150B. Founder Oracle. Majority stake in island of Lanai, Hawaii. Oracle owns TikTok US data infrastructure. Rep-leaning."},
  {id:"buffett",l:"Warren Buffett",s:"person",r:22,c:P.person,p:"dem",info:"~$130B. CEO Berkshire Hathaway. Dem-leaning donations. Pledged 99%+ of wealth to Gates Foundation and family foundations."},
  {id:"page",l:"Larry Page",s:"person",r:20,c:P.person,p:"dem",info:"~$130B. Google co-founder. Retains majority voting control of Alphabet via Class B shares. Dem-leaning historically."},
  {id:"brin",l:"Sergey Brin",s:"person",r:20,c:P.person,p:"dem",info:"~$120B. Google co-founder. Retains majority voting control of Alphabet. Dem-leaning."},
  {id:"ballmer",l:"Steve Ballmer",s:"person",r:19,c:P.person,p:"rep",info:"~$120B. Former Microsoft CEO. Owns LA Clippers NBA team. Rep-leaning."},
  {id:"dell",l:"Michael Dell",s:"person",r:19,c:P.person,p:"rep",info:"~$100B. Dell Technologies founder. MSD Capital family office. Rep-leaning."},
  {id:"walton_rob",l:"Rob Walton",s:"person",r:18,c:P.person,p:"rep",info:"~$60B. Walmart heir. Owns Denver Broncos NFL team. Rep-leaning Walton family."},
  {id:"walton_alice",l:"Alice Walton",s:"person",r:18,c:P.person,p:"rep",info:"~$60B. Walmart heir. Funds Crystal Bridges art museum. Rep-leaning."},
  {id:"walton_jim",l:"Jim Walton",s:"person",r:18,c:P.person,p:"rep",info:"~$60B. Walmart heir. Heads Arvest Bank. Rep-leaning."},
  {id:"adani",l:"Gautam Adani",s:"person",r:19,c:P.person,p:"none",info:"~$80B. Indian conglomerate Adani Group: ports, airports, power, cement, media. Close ties to Modi government."},
  {id:"ambani",l:"Mukesh Ambani",s:"person",r:19,c:P.person,p:"none",info:"~$100B. Reliance Industries: oil refining, telecom (Jio), retail, media. India's largest private company."},
  {id:"arnault",l:"Bernard Arnault",s:"person",r:21,c:P.person,p:"none",info:"~$200B (peak). LVMH chairman. Owns Louis Vuitton, Dior, Givenchy, Tiffany, Sephora, Dom Pérignon, Hennessy, Le Bon Marché."},
  {id:"koch_charles",l:"Charles Koch",s:"person",r:20,c:P.person,p:"rep",info:"~$60B. Koch Industries co-owner. Americans for Prosperity PAC. ~$49M donated 2024, ~90% Republican. Libertarian-right politics."},
  {id:"soros",l:"George Soros",s:"person",r:19,c:P.person,p:"dem",info:"~$7B (gave away most). Open Society Foundations $25B+ donated. Massive Dem donations. Funds progressive DA races, immigration NGOs, media."},
  {id:"murdoch",l:"Rupert Murdoch",s:"person",r:20,c:P.person,p:"rep",info:"~$20B. News Corp/Fox Corp founder. Dual-class shares retain family control. Fox News, WSJ, NY Post. Rep-leaning. Australia-born US citizen."},
  {id:"icahn",l:"Carl Icahn",s:"person",r:18,c:P.person,p:"rep",info:"~$15B. Corporate raider. Icahn Enterprises: energy, food, automotive, real estate. Rep-leaning. Former Trump advisor."},
  {id:"dimon",l:"Jamie Dimon",s:"person",r:18,c:P.person,p:"mix",info:"~$2B personal. JPMorgan CEO. Mixed political donations. Considered potential Treasury Secretary by both parties."},
  {id:"son",l:"Masayoshi Son",s:"person",r:19,c:P.person,p:"none",info:"~$25B. SoftBank founder. Vision Fund invested $100B+. Pledged $100B US investment after Trump election 2024."},

  // ENERGY
  {id:"exxon",l:"ExxonMobil",s:"energy",r:21,c:P.rep,p:"rep",info:"$636B. ~85% Republican PAC. Lobbied $18M in 2024. Oil, gas, chemicals, carbon capture. 56 countries."},
  {id:"chevron",l:"Chevron",s:"energy",r:19,c:P.rep,p:"rep",info:"$382B. ~75% Republican. Oil, gas, refining, renewables. 180 countries. Major LNG producer."},
  {id:"shell",l:"Shell",s:"energy",r:17,c:P.mix,p:"mix",info:"$262B. Mixed. Oil, gas, LNG, solar, wind, EV charging. World's largest LNG trader."},
  {id:"total",l:"TotalEnergies",s:"energy",r:16,c:P.mix,p:"mix",info:"$208B. French state partial stake. Oil, gas, LNG, solar, wind, EV. Most diversified energy major."},
  {id:"bp",l:"BP",s:"energy",r:16,c:P.mix,p:"mix",info:"$90B. British. Mixed. Oil, gas, wind, solar, EV charging. UK govt pension funds major shareholders."},
  {id:"nextera",l:"NextEra Energy",s:"energy",r:15,c:P.mix,p:"mix",info:"$145B. Mixed. World's largest wind & solar producer. Also owns Florida Power & Light utility."},
  {id:"constellation",l:"Constellation Energy",s:"energy",r:13,c:P.mix,p:"mix",info:"$60B. Largest nuclear operator in US. Acquired Calpine 2025. 90% carbon-free generation."},
  {id:"aramco",l:"Saudi Aramco",s:"energy",r:22,c:P.state,p:"state",info:"State-owned. No US donations. World's largest oil company. 12.9M barrels/day."},
  {id:"Koch_e",l:"Koch/Flint Hills",s:"energy",r:19,c:P.rep,p:"rep",info:"Koch Industries refining arm. One of largest US petroleum refiners. Gasoline, diesel, jet fuel, asphalt. Privately held — no public reporting."},
  {id:"duke",l:"Duke Energy",s:"energy",r:14,c:P.mix,p:"mix",info:"$75B. Mix. Largest US electric utility by customers. Coal, gas, nuclear, growing renewables. 8.4M customers. Carolinas, Midwest, Florida."},
  {id:"sempra",l:"Sempra Energy",s:"energy",r:13,c:P.mix,p:"mix",info:"$45B. Mix. Natural gas infrastructure. Owns SoCalGas, San Diego Gas. Major LNG export developer."},

  // RESOURCES / MINING
  {id:"bhp",l:"BHP Group",s:"resources",r:19,c:P.mix,p:"mix",info:"$126B. Mixed. World's largest miner. Iron ore, copper, nickel, potash. Australia, Chile, Canada."},
  {id:"rio",l:"Rio Tinto",s:"resources",r:18,c:P.mix,p:"mix",info:"$103B. Mixed. Iron ore, aluminum, copper, lithium. Merger talks with Glencore creating world's largest miner."},
  {id:"glencore",l:"Glencore",s:"resources",r:17,c:P.mix,p:"mix",info:"$55B. Mixed. World's largest commodity trader AND miner. Largest coal shipper, largest cobalt producer."},
  {id:"vale",l:"Vale",s:"resources",r:16,c:P.state,p:"state",info:"Brazilian state partial. World's largest iron ore and nickel producer."},
  {id:"freeport",l:"Freeport-McMoRan",s:"resources",r:14,c:P.rep,p:"rep",info:"$50B. ~65% Rep. World's largest publicly traded copper producer."},
  {id:"angloamerican",l:"Anglo American",s:"resources",r:14,c:P.mix,p:"mix",info:"$30B. Mix. Platinum (world leader), diamonds via De Beers, copper, iron ore."},
  {id:"barrick",l:"Barrick Gold",s:"resources",r:13,c:P.mix,p:"mix",info:"$35B. Mixed. Second largest gold miner globally. Operations in 18 countries. Canada-based."},
  {id:"mosaic",l:"Mosaic Company",s:"resources",r:12,c:P.mix,p:"mix",info:"$10B. Mix. World's largest phosphate and potash producer. Critical for global food supply."},

  // FISCAL / BANKING
  {id:"jpmorgan",l:"JPMorgan Chase",s:"fiscal",r:23,c:P.mix,p:"mix",info:"$4.8T AUM. Mixed — donates heavily to both. Largest US bank. Owns Chase Bank, J.P. Morgan investment banking, InstaMed. Traces to 1799."},
  {id:"bofa",l:"Bank of America",s:"fiscal",r:19,c:P.dem,p:"dem",info:"$300B. Lean-Dem. Owns Merrill Lynch. Largest mortgage originator."},
  {id:"citigroup",l:"Citigroup",s:"fiscal",r:17,c:P.dem,p:"dem",info:"$150B. Mix lean-Dem. 95 countries. Most globally dispersed US bank."},
  {id:"wellsfargo",l:"Wells Fargo",s:"fiscal",r:18,c:P.mix,p:"mix",info:"$230B. Mix. Dominates US mortgage origination."},
  {id:"goldman",l:"Goldman Sachs",s:"fiscal",r:18,c:P.mix,p:"mix",info:"$160B. Mixed. Revolving door with US Treasury and Federal Reserve."},
  {id:"hsbc",l:"HSBC",s:"fiscal",r:17,c:P.state,p:"state",info:"$3.2T assets. UK-registered. Primary conduit between Western capital and Asia/Middle East. 57 countries."},
  {id:"fedreserve",l:"Federal Reserve",s:"fiscal",r:19,c:P.state,p:"state",info:"Technically owned by its member banks (JPMorgan, BofA etc). Sets interest rates for entire US economy."},
  {id:"imf",l:"IMF",s:"fiscal",r:16,c:P.state,p:"state",info:"International Monetary Fund. 190 member countries. Lends to governments, imposes structural adjustment conditions. Major US influence via vote share."},
  {id:"worldbank",l:"World Bank",s:"fiscal",r:16,c:P.state,p:"state",info:"$100B+ lending per year. US holds largest vote share. Funds development, infrastructure, health programs globally."},
  {id:"bis",l:"BIS Basel",s:"fiscal",r:14,c:P.state,p:"state",info:"Bank for International Settlements. Central bank of central banks. Sets global banking standards (Basel accords). Switzerland. 63 member central banks."},

  // COMMERCE / TECH
  {id:"walmart",l:"Walmart",s:"commerce",r:21,c:P.rep,p:"rep",info:"$650B. Lean-Rep. World's largest retailer. Owns Sam's Club, Flipkart (India). 2.1M employees."},
  {id:"amazon",l:"Amazon",s:"commerce",r:23,c:P.dem,p:"dem",info:"$2.5T. Lean-Dem. Owns AWS (US military/CIA cloud), Whole Foods, MGM Studios, Ring, Twitch. Bezos owns WaPo."},
  {id:"alphabet",l:"Alphabet/Google",s:"commerce",r:22,c:P.dem,p:"dem",info:"$2T. Dem-leaning. Google, YouTube, Android, Waymo, DeepMind, Verily, Wing. Page/Brin retain majority voting control."},
  {id:"meta",l:"Meta",s:"commerce",r:20,c:P.mix,p:"mix",info:"$1.4T. Mixed. Zuckerberg shifted toward Trump 2024. Facebook, Instagram, WhatsApp, Oculus."},
  {id:"apple",l:"Apple",s:"commerce",r:23,c:P.mix,p:"mix",info:"$3.5T market cap. Mix. Tim Cook. 90% manufactured in China. App Store monopoly. $275B China deal 2016. Largest company by market cap."},
  {id:"microsoft",l:"Microsoft",s:"commerce",r:22,c:P.mix,p:"mix",info:"$3T. Mix. Owns LinkedIn, GitHub, Activision Blizzard, OpenAI 49% stake. Azure cloud #2 globally. Satya Nadella CEO."},
  {id:"nvidia",l:"Nvidia",s:"commerce",r:21,c:P.mix,p:"mix",info:"$3T+. Mix. Dominates AI chip market (80%+ share). Jensen Huang CEO/founder. GPUs power all major AI models."},
  {id:"softbank",l:"SoftBank",s:"commerce",r:16,c:P.state,p:"none",info:"Japanese. Vision Fund: Uber, DoorDash, ARM Holdings (base of mobile computing), TikTok, Alibaba. Masayoshi Son controls."},
  {id:"tencent",l:"Tencent",s:"commerce",r:19,c:P.state,p:"state",info:"$400B. Chinese state-linked. WeChat, QQ, gaming (Riot Games, Epic Games stakes), Spotify stake. Chinese govt holds 'golden share' veto."},
  {id:"alibaba",l:"Alibaba",s:"commerce",r:18,c:P.state,p:"state",info:"$200B. Chinese state-linked. E-commerce, Alipay, Alibaba Cloud. Jack Ma sidelined by CCP after criticizing regulators."},
  {id:"oracle",l:"Oracle",s:"commerce",r:16,c:P.rep,p:"rep",info:"$350B. Rep-leaning. Larry Ellison. Hosts TikTok US data. Cloud, database software, health records via Cerner."},
  {id:"tesla",l:"Tesla",s:"commerce",r:18,c:P.rep,p:"rep",info:"$700B. Rep/Musk. EVs, energy storage, Powerwall, Solar Roof. Gigafactories in US, China, Germany. Musk owns ~13%."},
  {id:"spacex",l:"SpaceX",s:"commerce",r:17,c:P.rep,p:"rep",info:"Private. $200B+ valuation. Musk controls. NASA contracts, Pentagon satellite launches, Starlink internet. Dominates rocket launches globally."},

  // MEDIA
  {id:"disney",l:"Walt Disney Co",s:"media",r:19,c:P.dem,p:"dem",info:"$190B. Lean-Dem. ABC, ESPN, FX, National Geographic, Disney+, Hulu (majority), Marvel Studios, Lucasfilm, Pixar, 20th Century Studios, Disney Parks."},
  {id:"comcast",l:"Comcast/NBCU",s:"media",r:18,c:P.dem,p:"dem",info:"Roberts family 33.3% supervoting control. NBC, MSNBC, CNBC, Bravo, USA Network, Syfy, E!, Universal Pictures, Sky (European TV), Peacock, Xfinity."},
  {id:"newscorp",l:"News Corp",s:"media",r:17,c:P.rep,p:"rep",info:"Murdoch family supervoting. WSJ, Barron's, NY Post, HarperCollins, Dow Jones, most Australian media."},
  {id:"foxcorp",l:"Fox Corp",s:"media",r:17,c:P.rep,p:"rep",info:"Murdoch family. Fox News, Fox Sports, Fox Broadcasting, Tubi. Separate from News Corp since 2013 split."},
  {id:"warnerbros",l:"Warner Bros Discovery",s:"media",r:17,c:P.mix,p:"mix",info:"$35B. Mixed. HBO, CNN, TNT, TBS, Discovery, HGTV, Food Network, DC Comics, Warner Bros films. David Zaslav CEO."},
  {id:"paramount",l:"Paramount Global",s:"media",r:15,c:P.mix,p:"mix",info:"$10B. Mixed. CBS, MTV, BET, Nickelodeon, Comedy Central, Paramount+. Shari Redstone controls via National Amusements."},
  {id:"iheartmedia",l:"iHeartMedia",s:"media",r:13,c:P.rep,p:"rep",info:"~$1B. Lean-Rep. Largest US radio network. 850+ stations. Rush Limbaugh historically. Also outdoor advertising."},
  {id:"nyt",l:"New York Times Co",s:"media",r:12,c:P.dem,p:"dem",info:"$8B. Lean-Dem. NYT, The Athletic, Wordle, Wirecutter. Sulzberger family controlling shares."},
  {id:"sinclair",l:"Sinclair Broadcast",s:"media",r:13,c:P.rep,p:"rep",info:"~$5B. Lean-Rep. 72% of US households' local TV. Largest local TV station group. Conservative must-run segments."},

  // FOOD & CONSUMER
  {id:"nestle",l:"Nestlé",s:"food",r:19,c:P.mix,p:"mix",info:"$250B Swiss. World's largest food company. Nespresso, KitKat, Nescafé, Purina, Gerber, San Pellegrino, Häagen-Dazs, Maggi. ~2,000 brands."},
  {id:"pepsico",l:"PepsiCo",s:"food",r:18,c:P.mix,p:"mix",info:"$230B. Mixed. Pepsi, Gatorade, Lay's, Doritos, Cheetos, Quaker Oats, Tropicana, Mountain Dew. One of largest food companies."},
  {id:"cocacola",l:"Coca-Cola",s:"food",r:17,c:P.mix,p:"mix",info:"$260B. Mixed. Coca-Cola, Sprite, Fanta, Powerade, Dasani, Minute Maid, Costa Coffee, Smartwater. 200+ countries."},
  {id:"kraftheinz",l:"Kraft Heinz",s:"food",r:16,c:P.mix,p:"mix",info:"$40B. Mixed. Kraft, Heinz, Oscar Mayer, Jell-O, Kool-Aid, Philadelphia cream cheese. 3G Capital and Berkshire own major stakes."},
  {id:"mars",l:"Mars Inc",s:"food",r:16,c:P.mix,p:"mix",info:"Private. Mars family. Snickers, M&Ms, Twix, Skittles, Wrigley gum, Pedigree, Whiskas pet food, Uncle Ben's rice."},
  {id:"unilever",l:"Unilever",s:"food",r:18,c:P.mix,p:"mix",info:"$120B British-Dutch. Dove, Axe/Lynx, Ben & Jerry's, Hellmann's, Knorr, Lipton, Vaseline, TRESemmé, Domestos. 400+ brands."},
  {id:"pg",l:"P&G",s:"consumer",r:18,c:P.mix,p:"mix",info:"$380B. Mixed. Tide, Pampers, Gillette, Oral-B, Head & Shoulders, Olay, Pantene, Charmin, Old Spice, Crest, Bounty."},
  {id:"jnj_consumer",l:"Kenvue (J&J Consumer)",s:"consumer",r:15,c:P.mix,p:"mix",info:"$40B. Spun from J&J 2023. Band-Aid, Tylenol, Listerine, Neutrogena, Johnson's Baby, Aveeno, Bengay."},
  {id:"mondelez",l:"Mondelēz",s:"food",r:16,c:P.mix,p:"mix",info:"$90B. Mixed. Oreo, Cadbury, Toblerone, Triscuit, Ritz crackers, Chips Ahoy, Halls. Spun from Kraft 2012."},
  {id:"generalmills",l:"General Mills",s:"food",r:15,c:P.mix,p:"mix",info:"$35B. Mixed. Cheerios, Lucky Charms, Wheaties, Pillsbury, Betty Crocker, Häagen-Dazs (US), Yoplait, Nature Valley."},
  {id:"abfoods",l:"Associated British Foods",s:"food",r:14,c:P.mix,p:"mix",info:"£24B UK. Primark retail, Twinings tea, Ovaltine, Kingsmill bread, Patak's, Ryvita."},

  // PHARMA
  {id:"jnj",l:"Johnson & Johnson",s:"pharma",r:20,c:P.mix,p:"mix",info:"$380B. Mixed. Janssen pharma (COVID vaccine, HIV drugs). Surgical devices, MedTech. Talc lawsuits, opioid settlements."},
  {id:"pfizer",l:"Pfizer",s:"pharma",r:20,c:P.dem,p:"dem",info:"$160B. Lean-Dem. mRNA COVID vaccines, Paxlovid, Lipitor, Viagra, Prevnar. Huge NIH/BARDA funding recipient."},
  {id:"merck",l:"Merck",s:"pharma",r:18,c:P.dem,p:"dem",info:"$320B. Lean-Dem. Keytruda cancer drug, Gardasil HPV vaccine, Januvia diabetes, Varivax. Major NIH collaborator."},
  {id:"abbvie",l:"AbbVie",s:"pharma",r:18,c:P.rep,p:"rep",info:"$310B. Lean-Rep. Humira (world's best-selling drug ever), Botox (acquired Allergan), Imbruvica cancer drug."},
  {id:"lilly",l:"Eli Lilly",s:"pharma",r:18,c:P.mix,p:"mix",info:"$750B. Mixed. Ozempic competitor Mounjaro/Tirzepatide, insulin (controls pricing), Prozac, Cialis."},
  {id:"amgen",l:"Amgen",s:"pharma",r:16,c:P.mix,p:"mix",info:"$170B. Mixed. Biologics pioneer. Enbrel, Otezla, Prolia. Horizon Therapeutics acquisition $28B."},
  {id:"roche",l:"Roche/Genentech",s:"pharma",r:18,c:P.mix,p:"mix",info:"$230B Swiss. Genentech (US subsidiary). Oncology leader. Herceptin, Avastin, Rituxan. Major diagnostics via Roche Diagnostics."},
  {id:"novartis",l:"Novartis",s:"pharma",r:17,c:P.mix,p:"mix",info:"$220B Swiss. Gene therapy, CAR-T cancer, heart failure drug Entresto. Sandoz generic drug spinoff."},
  {id:"astrazeneca",l:"AstraZeneca",s:"pharma",r:17,c:P.mix,p:"mix",info:"$270B British-Swedish. COVID vaccine (Oxford partnership), Tagrisso lung cancer, Farxiga diabetes."},
  {id:"bms",l:"Bristol-Myers Squibb",s:"pharma",r:16,c:P.mix,p:"mix",info:"$150B. Mixed. Opdivo/Nivolumab immunotherapy, Eliquis blood thinner, Revlimid blood cancer."},
  {id:"moderna",l:"Moderna",s:"pharma",r:15,c:P.dem,p:"dem",info:"$45B. Lean-Dem. mRNA COVID vaccine. Founded with DARPA/NIH mRNA funding. Multiple mRNA pipeline candidates."},
  {id:"gilead",l:"Gilead Sciences",s:"pharma",r:15,c:P.dem,p:"dem",info:"$85B. Lean-Dem. Remdesivir COVID, Truvada HIV, Sovaldi Hepatitis C. Major HIV/AIDS research."},
  {id:"sanofi",l:"Sanofi",s:"pharma",r:15,c:P.mix,p:"mix",info:"$130B French. Dupixent allergy/eczema, Lantus insulin, flu vaccines. French govt partial influence."},

  // MEDICAL RESEARCH & FUNDERS
  {id:"nih",l:"NIH",s:"research",r:19,c:P.dem,p:"dem",info:"$47B annual budget (pre-DOGE cuts). Funds 300,000+ researchers. NCI, NIAID (Fauci), NIMH. Grants to pharma, universities, foreign labs."},
  {id:"fda",l:"FDA",s:"research",r:16,c:P.mix,p:"mix",info:"Regulates all US pharmaceuticals, medical devices, food. Funded partly by pharma user fees ($2B+/yr) — structural conflict of interest."},
  {id:"cdc",l:"CDC",s:"research",r:16,c:P.mix,p:"mix",info:"$9B budget. Disease surveillance, vaccine recommendations via ACIP committee. Multiple former officials join pharma boards."},
  {id:"gatesfoundation",l:"Gates Foundation",s:"research",r:20,c:P.dem,p:"dem",info:"$75B endowment. Largest private global health funder. WHO's second largest funder. Vaccines via GAVI, CGIAR agricultural biotech, Common Core education."},
  {id:"wellcome",l:"Wellcome Trust",s:"research",r:17,c:P.mix,p:"mix",info:"$40B UK. Second largest medical research charity. Funds genomics, tropical disease, drug discovery. Major COVID-19 therapeutics funder."},
  {id:"hhmi",l:"Howard Hughes Medical Inst",s:"research",r:15,c:P.mix,p:"mix",info:"$25B endowment. Largest private US biomedical funder. Hughes Aircraft fortune. Funds basic research at universities."},
  {id:"darpa",l:"DARPA",s:"research",r:17,c:P.mix,p:"mix",info:"Defense Advanced Research Projects Agency. Funded mRNA vaccine platform (Moderna), internet (ARPANET), GPS. $4B budget. Military tech into commercial tech pipeline."},
  {id:"barda",l:"BARDA",s:"research",r:14,c:P.mix,p:"mix",info:"Biomedical Advanced Research and Development Authority. $5B+. Funds pandemic countermeasures. Contracted Pfizer/Moderna for COVID vaccines."},
  {id:"wuhan_lab",l:"Wuhan Inst of Virology",s:"research",r:14,c:P.state,p:"state",info:"Chinese Academy of Sciences lab. EcoHealth Alliance NIH subawards for bat coronavirus research. Lab leak hypothesis contested. BSL-4 facility."},
  {id:"ecohealth",l:"EcoHealth Alliance",s:"research",r:13,c:P.dem,p:"dem",info:"Peter Daszak led. Received NIH grants, subawarded to Wuhan Institute of Virology for bat coronavirus research. Defunded after lab leak scrutiny."},
  {id:"bezmialem",l:"Gain-of-Function Research",s:"research",r:12,c:P.mix,p:"mix",info:"Research enhancing pathogen transmissibility/virulence. Funded by NIH/NIAID. Controversial. Includes Wuhan subawards. Fauci testimony disputed."},
  {id:"lancet",l:"The Lancet",s:"research",r:12,c:P.dem,p:"dem",info:"Elite UK medical journal. Major COVID policy influence. EcoHealth's Daszak organized Lancet letter dismissing lab leak. Owned by Elsevier/RELX Group."},
  {id:"elsevier",l:"Elsevier/RELX",s:"research",r:14,c:P.mix,p:"mix",info:"$40B Dutch. World's largest academic publisher. Owns Lancet, Cell, ScienceDirect. ~$1B operating profit on publicly funded research."},

  // POLITICAL ORGANIZATIONS
  {id:"aipac",l:"AIPAC",s:"political",r:17,c:P.mix,p:"mix",info:"American Israel Public Affairs Committee. Largest US foreign policy lobby. $100M+ donated via affiliated PACs in 2024 cycle to both parties. Targets anti-Israel incumbents."},
  {id:"splc",l:"SPLC",s:"political",r:15,c:P.dem,p:"dem",info:"Southern Poverty Law Center. DOJ indicted April 2026 on wire fraud, bank fraud. Allegations: paid $3M+ to informants embedded in white supremacist groups. Donations tripled after Charlottesville ($50M→$132M). Classified conservative groups alongside hate groups."},
  {id:"opensociety",l:"Open Society Foundations",s:"political",r:17,c:P.dem,p:"dem",info:"George Soros. $25B+ donated. Funds progressive DAs, immigration NGOs, media organizations, anti-authoritarian movements globally. Operations in 120+ countries."},
  {id:"heritage",l:"Heritage Foundation",s:"political",r:15,c:P.rep,p:"rep",info:"Conservative think tank. Project 2025 authored. Koch, Bradley Foundation, Scaife funded. Major policy pipeline to Republican administrations."},
  {id:"afp",l:"Americans for Prosperity",s:"political",r:15,c:P.rep,p:"rep",info:"Koch brothers' political network. $400M+ per election cycle. Anti-regulatory, anti-tax. Grassroots organizing arm of Koch political operation."},
  {id:"cfr",l:"Council on Foreign Relations",s:"political",r:16,c:P.mix,p:"mix",info:"Elite foreign policy think tank. 5,000 members including virtually all senior US foreign policy officials across both parties. Funded by major banks, defense contractors."},
  {id:"wef",l:"World Economic Forum",s:"political",r:16,c:P.mix,p:"mix",info:"Davos. Klaus Schwab. Annual gathering of 2,500+ global elites. 'Stakeholder capitalism' agenda. Young Global Leaders program: Merkel, Macron, Gates, Zuckerberg."},
  {id:"inqtel",l:"In-Q-Tel",s:"intelligence",r:15,c:P.mix,p:"mix",info:"CIA's venture capital arm. $400M+ invested in 200+ companies. Palantir, Keyhole (→Google Earth), IQT Biosecurity. Bridges CIA intelligence needs with Silicon Valley."},
  {id:"palantir",l:"Palantir",s:"intelligence",r:16,c:P.rep,p:"rep",info:"$80B. Peter Thiel co-founded. CIA, NSA, military contracts. ICE deportation software. GOTHAM platform for law enforcement. Alex Karp CEO. Data surveillance infrastructure."},
  {id:"booz",l:"Booz Allen Hamilton",s:"intelligence",r:14,c:P.mix,p:"mix",info:"$10B. Mix. NSA's largest private contractor (Ed Snowden worked here). 29,000 security-cleared employees. Carlyle Group owned majority until IPO."},
  {id:"soros_dc",l:"Democracy Alliance",s:"political",r:13,c:P.dem,p:"dem",info:"Soros-linked donor consortium. Coordinates $100M+ annual giving to progressive infrastructure. Funds CAP, Media Matters, state-level organizing."},
  {id:"brookings",l:"Brookings Institution",s:"political",r:14,c:P.dem,p:"dem",info:"Center-left think tank. $100M+ budget. Funded by Gates Foundation, JPMorgan, defense contractors. Major policy influence on Democratic administrations."},

  // TOBACCO
  {id:"altria",l:"Altria Group",s:"tobacco",r:16,c:P.rep,p:"rep",info:"$80B. Lean-Rep. Formerly Philip Morris USA. Marlboro (40% US market). Owns 35% stake in e-cigarette Juul (collapsed in value). Wine via Ste. Michelle."},
  {id:"bat",l:"British American Tobacco",s:"tobacco",r:16,c:P.mix,p:"mix",info:"$60B British. Lucky Strike, Camel, Newport, Pall Mall, Vuse e-cig. 180 countries. Reynolds American subsidiary controls US market share."},
  {id:"pmintl",l:"Philip Morris Intl",s:"tobacco",r:15,c:P.mix,p:"mix",info:"$165B. Spun from Altria 2008. Marlboro internationally, IQOS heated tobacco. 180+ countries. Aggressively pivoting to 'smoke-free' products."},
  {id:"jti",l:"JTI (Japan Tobacco)",s:"tobacco",r:14,c:P.state,p:"state",info:"Japanese govt owns 33%. Camel, Winston, Salem. Major emerging markets focus. Acquired Reynolds International brands."},
  {id:"velo",l:"RJ Reynolds/BAT US",s:"tobacco",r:13,c:P.mix,p:"mix",info:"Newport, Camel, Pall Mall in US market. BAT subsidiary. Major nicotine pouch brands (Velo)."},

  // ALCOHOL
  {id:"abinbev",l:"AB InBev",s:"alcohol",r:18,c:P.mix,p:"mix",info:"$110B Belgian-Brazilian. Budweiser, Bud Light, Corona, Stella Artois, Beck's, Hoegaarden, Leffe. World's largest brewer. ~28% global beer market."},
  {id:"diageo",l:"Diageo",s:"alcohol",r:17,c:P.mix,p:"mix",info:"$60B British. Johnnie Walker, Guinness, Smirnoff, Baileys, Captain Morgan, Tanqueray. World's largest spirits company. 180 countries."},
  {id:"heineken",l:"Heineken",s:"alcohol",r:15,c:P.mix,p:"mix",info:"$45B Dutch. Heineken, Amstel, Tiger, Dos Equis, Sol. 190 countries. FEMSA (Mexican) holds major stake."},
  {id:"pernod",l:"Pernod Ricard",s:"alcohol",r:15,c:P.mix,p:"mix",info:"$35B French. Absolut vodka, Jameson whiskey, Malibu, Beefeater gin, Chivas Regal, Mumm champagne."},
  {id:"lvmh_wine",l:"LVMH Wines & Spirits",s:"alcohol",r:14,c:P.mix,p:"mix",info:"Moët Hennessy division of LVMH. Dom Pérignon, Moët & Chandon, Veuve Clicquot, Hennessy cognac (world's largest). Arnault controls."},

  // CHEMICAL / PRECURSOR / DRUG SUPPLY CHAINS
  {id:"bayer",l:"Bayer AG",s:"chemical",r:17,c:P.mix,p:"mix",info:"$30B German. Owns Monsanto (GMO seeds, Roundup herbicide). Aspirin originator. Pharmaceuticals: Xarelto, Eylea. Massive glyphosate lawsuit liability ($10B+ settlements)."},
  {id:"basf",l:"BASF",s:"chemical",r:16,c:P.mix,p:"mix",info:"$50B German. World's largest chemical company. Agricultural chemicals, plastics, coatings, catalysts, pharmaceuticals intermediates."},
  {id:"dow",l:"Dow Chemical",s:"chemical",r:15,c:P.mix,p:"mix",info:"$40B. Mixed. Plastics, agricultural chemicals, performance materials. Merged with DuPont, then split into three companies."},
  {id:"dupont",l:"DuPont/Corteva",s:"chemical",r:15,c:P.mix,p:"mix",info:"$30B. Mixed. Agricultural seeds/pesticides via Corteva. PFAS 'forever chemicals' liability. Kevlar, Tyvek, Teflon."},
  {id:"syngenta",l:"Syngenta",s:"chemical",r:14,c:P.state,p:"state",info:"$50B. Owned by ChemChina (Chinese state). Seeds, pesticides. Acquired by China National Chemical Corp 2017. Critical global food supply influence."},
  {id:"chemchina",l:"ChemChina",s:"chemical",r:15,c:P.state,p:"state",info:"Chinese state-owned. World's largest chemical company by state. Owns Syngenta, ADAMA pesticides, Pirelli tires. Full CCP strategic control."},
  {id:"fentanyl_precursor",l:"Chinese Precursor Labs",s:"chemical",r:15,c:P.state,p:"state",info:"Chinese chemical manufacturers supply fentanyl precursors (4-ANPP, NPP, acetylfentanyl) to Mexican cartels (Sinaloa, CJNG). DEA-documented. Some state-linked, many nominally private. $billions in US street drug market annually."},
  {id:"sinaloa",l:"Sinaloa Cartel",s:"chemical",r:14,c:"#804040",p:"none",info:"World's largest drug trafficking organization. Purchases Chinese precursor chemicals, synthesizes fentanyl in Mexico, distributes through US. Chapo Guzmán founded. El Mayo Zambada arrested 2024."},
  {id:"cjng",l:"CJNG Cartel",s:"chemical",r:13,c:"#804040",p:"none",info:"Jalisco New Generation Cartel. Major fentanyl producer. Also Chinese precursor supply chain. More violent competitor to Sinaloa. DEA Priority 1 target."},
  {id:"purdue",l:"Purdue Pharma",s:"pharma",r:14,c:P.rep,p:"rep",info:"Sackler family. OxyContin. Criminally pleaded guilty to opioid epidemic. $6B+ settlement. Dissolved. Sackler family paid $6B, avoided personal criminal charges. 500,000+ overdose deaths linked."},
  {id:"mallinckrodt",l:"Mallinckrodt",s:"pharma",r:12,c:P.mix,p:"mix",info:"Opioid manufacturer. Filed bankruptcy twice amid opioid litigation. Supplied bulk opioids to distributors. Also manufactures specialty pharmaceuticals."},
  {id:"mckesson",l:"McKesson",s:"pharma",r:14,c:P.mix,p:"mix",info:"$270B revenue. Largest US drug distributor. Fined $150M for opioid distribution. Distributes ~33% of all US pharmaceuticals and medical products."},
  {id:"amerisource",l:"AmerisourceBergen",s:"pharma",r:13,c:P.mix,p:"mix",info:"$240B revenue. Second largest US drug distributor. $6.6B opioid settlement. Key link between manufacturers and pharmacies."},

  // MILITARY / DEFENSE
  {id:"lockheed",l:"Lockheed Martin",s:"military",r:18,c:P.rep,p:"rep",info:"$65B. Lean-Rep. F-35 fighter (80% of revenues from government). Missile defense, satellites, space systems. Largest US defense contractor."},
  {id:"rtx",l:"RTX (Raytheon)",s:"military",r:17,c:P.rep,p:"rep",info:"$75B. Lean-Rep. Patriot missiles, Tomahawk, Javelin. Pratt & Whitney jet engines. Merged United Technologies + Raytheon 2020."},
  {id:"northrop",l:"Northrop Grumman",s:"military",r:16,c:P.rep,p:"rep",info:"$40B. Lean-Rep. B-21 Raider stealth bomber, GBSD nuclear missile replacement, cyber warfare, satellites."},
  {id:"boeing_def",l:"Boeing Defense",s:"military",r:16,c:P.mix,p:"mix",info:"$30B defense revenue. Mix. F/A-18, CH-47 Chinook, AH-64 Apache, Starliner (troubled). Also major commercial aircraft manufacturer."},
  {id:"generaldynamics",l:"General Dynamics",s:"military",r:15,c:P.rep,p:"rep",info:"$42B. Lean-Rep. Abrams tanks, Gulfstream private jets, submarines, IT services (GDIT). Navy shipbuilding via Bath Iron Works."},
  {id:"l3harris",l:"L3Harris Technologies",s:"military",r:14,c:P.rep,p:"rep",info:"$20B. Lean-Rep. Communications systems, ISR (intelligence/surveillance/reconnaissance), electronic warfare. NSA technology partnerships."},

  // REAL ESTATE / URBAN DEV
  {id:"blackstone_re",l:"Blackstone RE",s:"realestate",r:19,c:P.rep,p:"rep",info:"$300B+ RE AUM. World's largest real estate investor. Largest US landlord via BREIT rental housing fund. Office, logistics, data centers globally."},
  {id:"brookfield",l:"Brookfield Asset Mgmt",s:"realestate",r:18,c:P.mix,p:"mix",info:"$900B AUM. 65M sq ft US office. Infrastructure (toll roads, ports, pipelines), renewable energy, retail. Canadian. Global urban infrastructure ownership."},
  {id:"cbre",l:"CBRE Group",s:"realestate",r:16,c:P.mix,p:"mix",info:"$30B. World's largest commercial RE services firm. Manages 7.3B sq ft globally. 140K employees."},
  {id:"prologis",l:"Prologis",s:"realestate",r:15,c:P.mix,p:"mix",info:"$100B. Mix. World's largest industrial REIT. 1B sq ft of logistics/warehouse space. Amazon's largest landlord."},
  {id:"simon",l:"Simon Property Group",s:"realestate",r:14,c:P.rep,p:"rep",info:"$55B. Lean-Rep. Largest US mall operator. Premium outlets, shopping centers. 190+ properties. Owns stakes in retailers like JCPenney, Brooks Brothers."},
];

// ── EDGES ─────────────────────────────────────────────────────────────────────
const RAW_EDGES = [
  // Apex ↔ Apex
  ["vanguard","blackrock"],["temasek","blackrock"],["statestreet","blackrock"],["vanguard","statestreet"],
  ["vanguard","berkshire"],["blackrock","berkshire"],["blackrock","carlyle"],["blackrock","kkr"],
  ["blackrock","apollo"],["vanguard","blackstone"],["blackrock","blackstone"],
  // Sovereign → Apex
  ["norway","vanguard"],["norway","blackrock"],["cic","blackrock"],["adia","blackrock"],
  ["pif","blackrock"],["temasek","statestreet"],["gic","blackrock"],["qia","blackrock"],["kiw","blackrock"],
  // Billionaires → Companies
  ["musk","tesla"],["musk","spacex"],["musk","meta"],
  ["bezos","amazon"],["gates","gatesfoundation"],["gates","microsoft"],
  ["zuckerberg","meta"],["ellison","oracle"],["buffett","berkshire"],
  ["page","alphabet"],["brin","alphabet"],["murdoch","newscorp"],["murdoch","foxcorp"],
  ["arnault","lvmh_wine"],["koch_charles","afp"],["soros","opensociety"],
  ["son","softbank"],["walton_rob","walmart"],["walton_alice","walmart"],["walton_jim","walmart"],
  // Apex → Energy
  ["blackrock","exxon"],["blackrock","chevron"],["vanguard","exxon"],["vanguard","chevron"],
  ["statestreet","exxon"],["blackrock","nextera"],["vanguard","nextera"],["berkshire","nextera"],
  ["pif","aramco"],["blackrock","shell"],["vanguard","shell"],["blackrock","bp"],["vanguard","bp"],
  ["blackrock","duke"],["vanguard","duke"],
  // Apex → Resources
  ["blackrock","bhp"],["vanguard","bhp"],["blackrock","rio"],["vanguard","rio"],
  ["blackrock","freeport"],["blackrock","glencore"],["rio","glencore"],
  ["blackrock","mosaic"],["vanguard","mosaic"],
  // Apex → Fiscal
  ["vanguard","jpmorgan"],["blackrock","jpmorgan"],["vanguard","bofa"],["blackrock","bofa"],
  ["vanguard","goldman"],["blackrock","goldman"],["vanguard","citigroup"],["blackrock","citigroup"],
  ["berkshire","bofa"],["fedreserve","jpmorgan"],["fedreserve","bofa"],
  ["bis","fedreserve"],["imf","worldbank"],["vanguard","wellsfargo"],["blackrock","wellsfargo"],
  // Apex → Commerce/Tech
  ["blackrock","amazon"],["vanguard","amazon"],["blackrock","alphabet"],["vanguard","alphabet"],
  ["blackrock","meta"],["vanguard","meta"],["blackrock","walmart"],["vanguard","walmart"],
  ["softbank","amazon"],["gic","alphabet"],["qia","amazon"],["pif","softbank"],
  ["blackrock","apple"],["vanguard","apple"],["blackrock","microsoft"],["vanguard","microsoft"],
  ["blackrock","nvidia"],["vanguard","nvidia"],["blackrock","tesla"],["vanguard","tesla"],
  ["tencent","meta"],["cic","alibaba"],["cic","tencent"],
  // Apex → Media
  ["blackrock","disney"],["vanguard","disney"],["blackrock","comcast"],["vanguard","comcast"],
  ["blackrock","warnerbros"],["vanguard","warnerbros"],["blackrock","paramount"],["vanguard","paramount"],
  ["blackrock","nyt"],["vanguard","nyt"],
  // Apex → Food
  ["blackrock","nestle"],["vanguard","nestle"],["blackrock","unilever"],["vanguard","unilever"],
  ["blackrock","pepsico"],["vanguard","pepsico"],["blackrock","cocacola"],["vanguard","cocacola"],
  ["blackrock","pg"],["vanguard","pg"],["berkshire","kraftheinz"],
  // Apex → Pharma
  ["blackrock","jnj"],["vanguard","jnj"],["blackrock","pfizer"],["vanguard","pfizer"],
  ["blackrock","merck"],["vanguard","merck"],["blackrock","abbvie"],["vanguard","abbvie"],
  ["blackrock","lilly"],["vanguard","lilly"],["blackrock","amgen"],["vanguard","amgen"],
  ["blackrock","roche"],["vanguard","roche"],["blackrock","astrazeneca"],["vanguard","astrazeneca"],
  ["blackrock","moderna"],["vanguard","moderna"],["blackrock","gilead"],["vanguard","gilead"],
  // Research connections
  ["nih","pfizer"],["nih","moderna"],["nih","jnj"],["nih","merck"],
  ["nih","ecohealth"],["ecohealth","wuhan_lab"],["darpa","moderna"],
  ["barda","pfizer"],["barda","moderna"],["barda","jnj"],["barda","astrazeneca"],
  ["gatesfoundation","nih"],["gatesfoundation","pfizer"],["gatesfoundation","astrazeneca"],
  ["gatesfoundation","merck"],["gatesfoundation","wuhan_lab"],
  ["wellcome","astrazeneca"],["wellcome","nih"],
  ["fda","pfizer"],["fda","moderna"],["fda","jnj"],["fda","merck"],
  ["cdc","pfizer"],["cdc","moderna"],["cdc","merck"],
  ["elsevier","lancet"],["lancet","ecohealth"],
  // Political
  ["opensociety","soros_dc"],["opensociety","splc"],["opensociety","brookings"],
  ["gatesfoundation","cfr"],["jpmorgan","cfr"],["blackrock","cfr"],
  ["heritage","afp"],["koch_charles","heritage"],
  ["aipac","jpmorgan"],["aipac","bofa"],
  ["wef","blackrock"],["wef","gatesfoundation"],["wef","jpmorgan"],
  // Intelligence
  ["inqtel","palantir"],["inqtel","alphabet"],["inqtel","amazon"],
  ["darpa","alphabet"],["amazon","inqtel"],
  ["booz","inqtel"],["carlyle","booz"],
  // Tobacco
  ["blackrock","altria"],["vanguard","altria"],["blackrock","bat"],["vanguard","bat"],
  ["altria","pmintl"],["bat","pmintl"],
  // Alcohol
  ["blackrock","abinbev"],["vanguard","abinbev"],["blackrock","diageo"],["vanguard","diageo"],
  ["arnault","lvmh_wine"],["abinbev","heineken"],
  // Chemical / Drug chains
  ["chemchina","syngenta"],["bayer","basf"],
  ["blackrock","bayer"],["vanguard","bayer"],["blackrock","basf"],
  ["fentanyl_precursor","sinaloa"],["fentanyl_precursor","cjng"],
  ["sinaloa","purdue"],
  ["purdue","mckesson"],["purdue","amerisource"],
  ["mckesson","jnj"],["amerisource","jnj"],
  ["blackrock","mckesson"],["blackrock","amerisource"],
  // Military
  ["blackrock","lockheed"],["vanguard","lockheed"],["blackrock","rtx"],["vanguard","rtx"],
  ["blackrock","northrop"],["vanguard","northrop"],["blackrock","boeing_def"],
  ["vanguard","generaldynamics"],["carlyle","lockheed"],["kkr","l3harris"],
  ["darpa","lockheed"],["darpa","boeing_def"],
  ["inqtel","lockheed"],
  // Real estate
  ["blackrock","blackstone_re"],["vanguard","blackstone_re"],
  ["blackrock","brookfield"],["vanguard","brookfield"],["blackrock","cbre"],
  ["adia","blackstone_re"],["gic","blackstone_re"],
  ["blackstone_re","brookfield"],["brookfield","cbre"],
  ["jpmorgan","blackstone_re"],["blackstone","blackstone_re"],["carlyle","blackstone_re"],
  ["amazon","prologis"],["blackrock","prologis"],["vanguard","prologis"],
  // Cross-sector interesting links
  ["microsoft","openai_stake"],["nvidia","openai_stake"],
  ["oracle","tiktok_data"],["microsoft","tiktok_data"],
  ["jnj","jnj_consumer"],
];

// fix missing nodes referenced in edges
const EXTRA_NODES = [
  {id:"openai_stake",l:"OpenAI",s:"commerce",r:14,c:P.tech,p:"mix",info:"$157B valuation (2024). Microsoft 49% stake. Nvidia investor. Sam Altman CEO. GPT-4, DALL-E, Sora. Rapidly expanding into enterprise, government, and healthcare."},
  {id:"tiktok_data",l:"TikTok/ByteDance",s:"media",r:15,c:P.state,p:"state",info:"ByteDance parent (Chinese). TikTok US data stored on Oracle servers. 170M US users. CCP national security concerns. Forced divestiture law passed, enforcement contested."},
];

const NODES = [...RAW_NODES, ...EXTRA_NODES];
const EDGES = [...RAW_EDGES, ["microsoft","openai_stake"],["oracle","tiktok_data"],["cic","tencent"]];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

// ── LAYOUT ────────────────────────────────────────────────────────────────────
function initLayout(W, H) {
  const pos = {};
  const cx = W / 2, cy = H / 2;
  const sectorAngles = {
    apex: -Math.PI / 2, sovereign: -Math.PI / 6,
    person: Math.PI / 6, energy: Math.PI / 2,
    resources: (2 * Math.PI) / 3, fiscal: Math.PI,
    commerce: -Math.PI * 5 / 6, media: -Math.PI * 2 / 3,
    food: -Math.PI / 3, pharma: Math.PI / 3,
    research: Math.PI * 2 / 3, political: -Math.PI * 5 / 6,
    consumer: -Math.PI / 4, tobacco: Math.PI * 5 / 6,
    alcohol: Math.PI * 11 / 12, chemical: Math.PI * 3 / 4,
    military: -Math.PI * 3 / 4, intelligence: -Math.PI * 11 / 12,
    realestate: Math.PI * 5 / 12,
  };

  const bySector = {};
  NODES.forEach(n => { (bySector[n.s] = bySector[n.s] || []).push(n); });

  const apexR = Math.min(W, H) * 0.14;
  const midR = Math.min(W, H) * 0.28;
  const outerR = Math.min(W, H) * 0.42;
  const edgeR = Math.min(W, H) * 0.52;

  const innerSectors = ["apex", "sovereign"];
  const midSectors = ["person", "fiscal", "commerce"];
  const outerSectors = ["energy", "resources", "media", "food", "pharma", "research", "political", "consumer", "realestate"];
  const edgeSectors = ["tobacco", "alcohol", "chemical", "military", "intelligence"];

  const place = (nodes, baseAngle, radius, spreadFactor = 1) => {
    nodes.forEach((n, i) => {
      const spread = (spreadFactor * Math.PI * 2) / Math.max(nodes.length, 1);
      const a = baseAngle + (i - (nodes.length - 1) / 2) * spread;
      pos[n.id] = { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    });
  };

  innerSectors.forEach((sec, si) => {
    const nodes = bySector[sec] || [];
    const base = (si / innerSectors.length) * Math.PI * 2 - Math.PI / 2;
    place(nodes, base, apexR, 0.6 / innerSectors.length);
  });

  midSectors.forEach((sec, si) => {
    const nodes = bySector[sec] || [];
    const base = (si / midSectors.length) * Math.PI * 2 - Math.PI / 2;
    place(nodes, base, midR, 0.6 / midSectors.length);
  });

  outerSectors.forEach((sec, si) => {
    const nodes = bySector[sec] || [];
    const base = (si / outerSectors.length) * Math.PI * 2 - Math.PI / 2;
    place(nodes, base, outerR + (si % 2) * 30, 0.55 / outerSectors.length);
  });

  edgeSectors.forEach((sec, si) => {
    const nodes = bySector[sec] || [];
    const base = (si / edgeSectors.length) * Math.PI * 2 - Math.PI / 4;
    place(nodes, base, edgeR + (si % 2) * 25, 0.5 / edgeSectors.length);
  });

  return pos;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function App() {
  const canvasRef = useRef(null);
  const posRef = useRef({});
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragNodeRef = useRef(null);
  const dragPanRef = useRef(null);
  const hovRef = useRef(null);
  const touchRef = useRef({});
  const initDone = useRef(false);

  const [tab, setTab] = useState("map");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [highlighted, setHighlighted] = useState(null);

  const filterRef = useRef("all");
  const highlightedRef = useRef(null);

  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { highlightedRef.current = highlighted; }, [highlighted]);

  const hexRGB = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

  const getVisible = useCallback((f) => {
    if (f === "all") return NODES;
    return NODES.filter(n => n.s === f);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const scale = scaleRef.current;
    const pan = panRef.current;
    const f = filterRef.current;
    const hl = highlightedRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // Grid
    const gs = 80;
    ctx.strokeStyle = "#e8e4dc";
    ctx.lineWidth = 0.5 / scale;
    for (let x = -2000; x < 4000; x += gs) { ctx.beginPath(); ctx.moveTo(x, -2000); ctx.lineTo(x, 4000); ctx.stroke(); }
    for (let y = -2000; y < 4000; y += gs) { ctx.beginPath(); ctx.moveTo(-2000, y); ctx.lineTo(4000, y); ctx.stroke(); }

    const vis = getVisible(f);
    const visIds = new Set(vis.map(n => n.id));
    const hlEdges = hl ? new Set(EDGES.filter(([a,b]) => a===hl||b===hl).map(([a,b])=>a===hl?b:a)) : null;

    // Sector labels
    const bySec = {};
    vis.forEach(n => { (bySec[n.s] = bySec[n.s] || []).push(n); });
    Object.entries(bySec).forEach(([sec, nodes]) => {
      if (!nodes.length) return;
      const xs = nodes.map(n => posRef.current[n.id]?.x).filter(Boolean);
      const ys = nodes.map(n => posRef.current[n.id]?.y).filter(Boolean);
      if (!xs.length) return;
      const cx2 = xs.reduce((a,b)=>a+b,0)/xs.length;
      const cy2 = ys.reduce((a,b)=>a+b,0)/ys.length;
      const col = SEC_COLOR[sec] || "#888";
      ctx.font = `bold ${10/scale}px sans-serif`;
      ctx.fillStyle = col + "60";
      ctx.textAlign = "center";
      ctx.fillText(sec.toUpperCase(), cx2, cy2 - 40/scale);
    });

    // Edges
    EDGES.forEach(([a, b]) => {
      if (!visIds.has(a) || !visIds.has(b)) return;
      const pa = posRef.current[a], pb = posRef.current[b];
      if (!pa || !pb) return;
      const na = nodeMap[a], nb = nodeMap[b];
      if (!na || !nb) return;
      const isHL = hl && (a === hl || b === hl);
      const isDim = hl && !isHL;
      const [r1,g1,b1] = hexRGB(na.c || "#888");
      const [r2,g2,b2] = hexRGB(nb.c || "#888");
      const gr = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
      const alpha = isDim ? 0.04 : isHL ? 0.7 : 0.15;
      gr.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
      gr.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);
      ctx.strokeStyle = gr;
      ctx.lineWidth = (isHL ? 1.5 : 0.8) / scale;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Nodes
    vis.forEach(n => {
      const p = posRef.current[n.id];
      if (!p) return;
      const isHov = hovRef.current === n.id;
      const isHL2 = hl === n.id;
      const isConn = hlEdges && hlEdges.has(n.id);
      const isDim = hl && !isHL2 && !isConn;
      const [r,g,b2] = hexRGB(n.c || "#888");

      ctx.globalAlpha = isDim ? 0.2 : 1;

      if (!isDim) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, n.r * 2.5 / scale);
        glow.addColorStop(0, `rgba(${r},${g},${b2},${isHov||isHL2 ? 0.25 : 0.08})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.r * 2.5 / scale, 0, Math.PI * 2);
        ctx.fill();
      }

      const nr = n.r / scale;
      const fill = ctx.createRadialGradient(p.x - nr * 0.3, p.y - nr * 0.3, 0, p.x, p.y, nr);
      fill.addColorStop(0, `rgba(${r},${g},${b2},0.5)`);
      fill.addColorStop(1, `rgba(${r},${g},${b2},0.12)`);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(p.x, p.y, nr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isHov || isHL2 ? n.c : `rgba(${r},${g},${b2},0.6)`;
      ctx.lineWidth = (isHov || isHL2 ? 2 : 1) / scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, nr, 0, Math.PI * 2);
      ctx.stroke();

      const fs = Math.max(7, Math.min(10, n.r * 0.45)) / scale;
      ctx.fillStyle = isHov || isHL2 ? "#1a1008" : `rgba(${r},${g},${b2},0.95)`;
      ctx.font = `${fs}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = n.l.split(" ");
      if (words.length === 1) {
        ctx.fillText(n.l, p.x, p.y);
      } else {
        const mid = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, mid).join(" "), p.x, p.y - fs * 0.65);
        ctx.fillText(words.slice(mid).join(" "), p.x, p.y + fs * 0.65);
      }

      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, [getVisible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (!initDone.current) {
        posRef.current = initLayout(canvas.width, canvas.height);
        initDone.current = true;
      }
      draw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  useEffect(() => { draw(); }, [filter, highlighted, draw]);

  const toWorld = (cx, cy) => {
    const pan = panRef.current, scale = scaleRef.current;
    return { x: (cx - pan.x) / scale, y: (cy - pan.y) / scale };
  };

  const getAt = (wx, wy, f) => {
    const vis = getVisible(f);
    const scale = scaleRef.current;
    for (let i = vis.length - 1; i >= 0; i--) {
      const n = vis[i];
      const p = posRef.current[n.id];
      if (!p) continue;
      const nr = n.r / scale;
      if ((wx - p.x) ** 2 + (wy - p.y) ** 2 <= nr * nr) return n;
    }
    return null;
  };

  const canvasXY = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseMove = useCallback(e => {
    const canvas = canvasRef.current; if (!canvas) return;
    const { x, y } = canvasXY(e, canvas);
    if (dragNodeRef.current) {
      const { id, ox, oy } = dragNodeRef.current;
      const w = toWorld(x, y);
      posRef.current[id] = { x: w.x + ox, y: w.y + oy };
      draw(); return;
    }
    if (dragPanRef.current) {
      panRef.current = { x: x - dragPanRef.current.ox, y: y - dragPanRef.current.oy };
      draw(); return;
    }
    const w = toWorld(x, y);
    const n = getAt(w.x, w.y, filterRef.current);
    if (n) {
      if (hovRef.current !== n.id) { hovRef.current = n.id; draw(); }
      setTooltip(n); setTipPos({ x: e.clientX, y: e.clientY });
    } else {
      if (hovRef.current) { hovRef.current = null; draw(); }
      setTooltip(null);
    }
  }, [draw]);

  const onMouseDown = useCallback(e => {
    const canvas = canvasRef.current; if (!canvas) return;
    const { x, y } = canvasXY(e, canvas);
    const w = toWorld(x, y);
    const n = getAt(w.x, w.y, filterRef.current);
    if (n) {
      const p = posRef.current[n.id];
      dragNodeRef.current = { id: n.id, ox: p.x - w.x, oy: p.y - w.y };
      setHighlighted(prev => prev === n.id ? null : n.id);
    } else {
      dragPanRef.current = { ox: x - panRef.current.x, oy: y - panRef.current.y };
    }
  }, []);

  const onMouseUp = useCallback(() => { dragNodeRef.current = null; dragPanRef.current = null; }, []);

  const onWheel = useCallback(e => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.2, Math.min(8, scaleRef.current * factor));
    panRef.current = {
      x: mx - (mx - panRef.current.x) * (newScale / scaleRef.current),
      y: my - (my - panRef.current.y) * (newScale / scaleRef.current),
    };
    scaleRef.current = newScale;
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Touch: pan + pinch zoom
  const onTouchStart = useCallback(e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = t.clientX - rect.left, cy = t.clientY - rect.top;
      const w = toWorld(cx, cy);
      const n = getAt(w.x, w.y, filterRef.current);
      if (n) {
        const p = posRef.current[n.id];
        dragNodeRef.current = { id: n.id, ox: p.x - w.x, oy: p.y - w.y };
        hovRef.current = n.id;
        setTooltip(n); setTipPos({ x: t.clientX, y: t.clientY });
        draw();
      } else {
        dragPanRef.current = { ox: cx - panRef.current.x, oy: cy - panRef.current.y };
      }
      touchRef.current = { lastDist: null };
    } else if (e.touches.length === 2) {
      dragNodeRef.current = null; dragPanRef.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = { lastDist: Math.sqrt(dx*dx+dy*dy) };
    }
  }, [draw]);

  const onTouchMove = useCallback(e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = t.clientX - rect.left, cy = t.clientY - rect.top;
      if (dragNodeRef.current) {
        const w = toWorld(cx, cy);
        posRef.current[dragNodeRef.current.id] = { x: w.x + dragNodeRef.current.ox, y: w.y + dragNodeRef.current.oy };
        draw();
      } else if (dragPanRef.current) {
        panRef.current = { x: cx - dragPanRef.current.ox, y: cy - dragPanRef.current.oy };
        draw();
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (touchRef.current.lastDist) {
        const factor = dist / touchRef.current.lastDist;
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const px = mx - rect.left, py = my - rect.top;
        const newScale = Math.max(0.2, Math.min(8, scaleRef.current * factor));
        panRef.current = {
          x: px - (px - panRef.current.x) * (newScale / scaleRef.current),
          y: py - (py - panRef.current.y) * (newScale / scaleRef.current),
        };
        scaleRef.current = newScale;
        draw();
      }
      touchRef.current = { lastDist: dist };
    }
  }, [draw]);

  const onTouchEnd = useCallback(() => { dragNodeRef.current = null; dragPanRef.current = null; }, []);

  const handleSearch = useCallback((q) => {
    setSearch(q);
    if (!q.trim()) { setHighlighted(null); return; }
    const lq = q.toLowerCase();
    const found = NODES.find(n => n.l.toLowerCase().includes(lq) || n.id.toLowerCase().includes(lq));
    if (found) {
      setHighlighted(found.id);
      setFilter("all");
      const p = posRef.current[found.id];
      const canvas = canvasRef.current;
      if (p && canvas) {
        scaleRef.current = 1.5;
        panRef.current = { x: canvas.width / 2 - p.x * 1.5, y: canvas.height / 2 - p.y * 1.5 };
      }
      draw();
    }
  }, [draw]);

  const sectors = ["all", ...new Set(NODES.map(n => n.s))];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#faf8f4", fontFamily: "Georgia, serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "2px solid #d4c8b8", padding: "8px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: "bold", color: "#2a2018", letterSpacing: 1 }}>Corporate Power Map</div>
            <div style={{ fontSize: 10, color: "#8a7a68", letterSpacing: 0.5 }}>Ownership, funding & political connections — 2024–2026</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["map","Map"],["sources","Sources"]].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab===t ? "#2a2018" : "transparent",
                color: tab===t ? "#faf8f4" : "#8a7a68",
                border: "1px solid #d4c8b8",
                fontFamily: "Georgia, serif",
                fontSize: 11, padding: "4px 12px", cursor: "pointer", borderRadius: 3,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {tab === "map" && (
          <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Find a company, person, or org..."
              style={{ flex: "1 1 200px", padding: "5px 10px", border: "1px solid #d4c8b8", borderRadius: 3, background: "#fff", fontFamily: "Georgia, serif", fontSize: 11, color: "#2a2018", outline: "none" }}
            />
            {search && <button onClick={() => { setSearch(""); setHighlighted(null); draw(); }} style={{ background: "none", border: "none", color: "#8a7a68", cursor: "pointer", fontSize: 16 }}>×</button>}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[["all","All"], ...Object.keys(SEC_COLOR).map(s=>[s,s.charAt(0).toUpperCase()+s.slice(1)])].slice(0,10).map(([s,l]) => (
                <button key={s} onClick={() => setFilter(s)} style={{
                  background: filter===s ? (SEC_COLOR[s]||"#2a2018") : "transparent",
                  color: filter===s ? "#fff" : "#8a7a68",
                  border: `1px solid ${SEC_COLOR[s]||"#d4c8b8"}`,
                  fontFamily: "Georgia, serif", fontSize: 9, padding: "3px 7px", cursor: "pointer", borderRadius: 2,
                }}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {tab === "map" && (
        <div style={{ background: "#fff8f0", borderBottom: "1px solid #e8dcc8", padding: "4px 14px", display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
          {[[P.dem,"Dem-lean"],[P.rep,"Rep-lean"],[P.mix,"Mixed"],[P.state,"State/Foreign"],[P.apex,"Apex Inst."],[P.person,"Billionaire"],[P.pharma,"Pharma"],[P.chemical,"Chemical/Drug"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#6a5a48" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: c, border: "1px solid #ccc" }} />
              {l}
            </div>
          ))}
          <div style={{ fontSize: 9, color: "#aaa", marginLeft: "auto" }}>Pinch to zoom · Drag to pan · Tap node to highlight connections</div>
        </div>
      )}

      {/* Content */}
      {tab === "map" ? (
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <canvas ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair", touchAction: "none" }}
            onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
            onMouseLeave={() => { dragNodeRef.current = null; dragPanRef.current = null; hovRef.current = null; setTooltip(null); draw(); }}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          />
          {tooltip && (
            <div style={{
              position: "fixed",
              left: Math.min(tipPos.x + 14, (typeof window !== "undefined" ? window.innerWidth : 400) - 270),
              top: Math.min(tipPos.y - 8, (typeof window !== "undefined" ? window.innerHeight : 600) - 160),
              background: "rgba(255,251,245,0.98)", border: `1px solid ${tooltip.c}60`,
              borderLeft: `3px solid ${tooltip.c}`,
              padding: "10px 14px", maxWidth: 260, pointerEvents: "none", zIndex: 50,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)", borderRadius: 4,
            }}>
              <div style={{ color: tooltip.c, fontSize: 13, fontWeight: "bold", marginBottom: 3 }}>{tooltip.l}</div>
              <div style={{ color: "#aaa", fontSize: 8, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>
                {tooltip.s} · {PARTY[tooltip.p] || ""}
              </div>
              <div style={{ color: "#5a4a38", fontSize: 10, lineHeight: 1.65 }}>{tooltip.info}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflow: "auto", padding: 20, background: "#faf8f4" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#2a2018", marginBottom: 6 }}>Sources & References</div>
            <div style={{ fontSize: 11, color: "#8a7a68", marginBottom: 20 }}>All data on ownership, political donations, and corporate connections is sourced from public filings, government databases, and investigative reporting. Links open in a new tab.</div>
            {SOURCES.map((s, i) => (
              <div key={i} style={{ borderBottom: "1px solid #e8dcc8", padding: "10px 0", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ color: "#d4c8b8", fontSize: 11, minWidth: 24, paddingTop: 1 }}>{i + 1}.</div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#2a6a8a", fontSize: 11, textDecoration: "none", lineHeight: 1.5 }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}>
                  {s.title}
                  <span style={{ color: "#aaa", marginLeft: 6, fontSize: 10 }}>↗ {s.url.replace("https://","").split("/")[0]}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
