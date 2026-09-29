export const LEXICONS = [
  {
    id: 'computing-software',
    title: 'Computing & Software',
    badge: 'Technology',
    field: 'Technology',
    iconType: 'code',
    description: 'Clear terminology for software, systems, and digital products.',
    coverage: 'Coverage: programming, cloud, security, data',
    termsCount: '5 terms shown',
    featured: true,
    featureTag: 'Software foundations',
    featureDesc: 'Useful for learners and teams translating technical product language into plain terms.'
  },
  {
    id: 'medicine-health',
    title: 'Medicine & Health',
    badge: 'Academic',
    field: 'Academic',
    iconType: 'heart',
    description: 'Essential vocabulary for clinical, public health, and care settings.',
    coverage: 'Coverage: anatomy, care, pharmacy, public health',
    termsCount: '4,200+ terms',
    featured: true,
    featureTag: 'Health in context',
    featureDesc: 'A helpful companion for understanding common medical and public health vocabulary.'
  },
  {
    id: 'law-government',
    title: 'Law & Government',
    badge: 'Professional',
    field: 'Professional',
    iconType: 'scale',
    description: 'Navigate legal language, public institutions, and civic processes.',
    coverage: 'Coverage: legislation, courts, policy, regulation',
    termsCount: '3,800+ terms',
    featured: false
  },
  {
    id: 'finance-economics',
    title: 'Finance & Economics',
    badge: 'Professional',
    field: 'Professional',
    iconType: 'trending',
    description: 'Practical vocabulary for markets, business, and economic analysis.',
    coverage: 'Coverage: banking, investment, accounting, trade',
    termsCount: '3,100+ terms',
    featured: false
  },
  {
    id: 'climate-environment',
    title: 'Climate & Environment',
    badge: 'Academic',
    field: 'Academic',
    iconType: 'leaf',
    description: 'Vocabulary for climate science, ecology, and sustainability.',
    coverage: 'Coverage: weather, energy, conservation, ecology',
    termsCount: '2,900+ terms',
    featured: true,
    featureTag: 'Climate language',
    featureDesc: 'Explore the terms behind environmental reporting, research, and climate action.'
  },
  {
    id: 'arts-media',
    title: 'Arts & Media',
    badge: 'Culture & Society',
    field: 'Culture & Society',
    iconType: 'clapperboard',
    description: 'Shared language for creative practice, journalism, and media.',
    coverage: 'Coverage: film, music, publishing, design',
    termsCount: '2,400+ terms',
    featured: false
  }
];

export const COMPUTING_LEXICON_TERMS = [
  {
    id: 'api',
    term: 'API',
    topic: 'Web',
    badge: 'Web',
    definition: 'A defined way for one software application to request data or actions from another.',
    usage: 'The mobile app uses an API to display the latest account data.',
    details: 'Application Programming Interface. APIs act as standardized contracts between client applications and server architectures, typically exchanging structured JSON payloads over HTTPS protocols.',
    related: ['REST', 'HTTP', 'JSON', 'Endpoint']
  },
  {
    id: 'algorithm',
    term: 'algorithm',
    topic: 'Data',
    badge: 'Data',
    definition: 'A step-by-step set of instructions used to solve a problem or complete a calculation.',
    usage: 'The search algorithm ranks the most relevant pages first.',
    details: 'Algorithms form the computational logic underpinning data sorting, graph traversal, cryptographic hashing, and automated decision-making engines.',
    related: ['Time Complexity', 'Data Structure', 'Binary Search']
  },
  {
    id: 'cloud-computing',
    term: 'cloud computing',
    topic: 'Security',
    badge: 'Security',
    definition: 'Using computing services such as storage or servers over the internet instead of running them locally.',
    usage: 'The team moved backups to cloud computing for easier recovery.',
    details: 'Cloud computing encompasses infrastructure as a service (IaaS), platform as a service (PaaS), and software as a service (SaaS), offering on-demand provisioning and automated scaling.',
    related: ['Virtualization', 'Scalability', 'Data Centers']
  },
  {
    id: 'open-source',
    term: 'open source',
    topic: 'Software',
    badge: 'Software',
    definition: 'Software whose source code is available for people to inspect, use, change, and share under its licence.',
    usage: 'The project is open source, so contributors can suggest improvements.',
    details: 'Open-source initiatives foster collaborative development, transparency, peer auditing, and open innovation across the global developer community.',
    related: ['Permissive License', 'Git', 'Fork', 'Repository']
  },
  {
    id: 'version-control',
    term: 'version control',
    topic: 'Software',
    badge: 'Software',
    definition: 'A system for recording and managing changes to files, especially source code, over time.',
    usage: 'Use version control to review a change before it reaches production.',
    details: 'Distributed version control systems (such as Git) allow teams to collaborate simultaneously through branching, pull requests, cherry-picks, and merge conflict resolution.',
    related: ['Git', 'Branching', 'Commit', 'Pull Request']
  },
  {
    id: 'rest',
    term: 'REST',
    topic: 'Web',
    badge: 'Web',
    definition: 'An architectural style for designing networked applications using standard stateless HTTP operations.',
    usage: 'Our team built a RESTful API with GET, POST, PUT, and DELETE endpoints.',
    details: 'Representational State Transfer principles emphasize stateless communication, cacheability, and uniform resource identifiers (URIs).',
    related: ['API', 'HTTP', 'JSON', 'Stateless']
  },
  {
    id: 'containerization',
    term: 'containerization',
    topic: 'Software',
    badge: 'Software',
    definition: 'Packaging an application and its dependencies together into an isolated runtime unit that runs consistently anywhere.',
    usage: 'We deploy microservices using containerization to avoid environment discrepancies.',
    details: 'Containers share the host OS kernel while providing isolated file systems, memory namespaces, and process trees.',
    related: ['Docker', 'Kubernetes', 'Microservices']
  },
  {
    id: 'encryption',
    term: 'encryption',
    topic: 'Security',
    badge: 'Security',
    definition: 'The process of encoding data into a secure format so that only authorized parties with a key can decipher it.',
    usage: 'End-to-end encryption ensures that messages remain confidential during network transit.',
    details: 'Symmetric and asymmetric cryptographic algorithms secure data at rest, data in transit, and digital identity signatures.',
    related: ['Cryptography', 'TLS/SSL', 'Public Key']
  }
];
