import voiceAgentImg from './images/voice_agents.png';
import ragAgentsImg from './images/rag_agents.png';
import marketingImg from './images/digital_marketing_automation.png';
import schedulerImg from './images/ai_scheduler.png';
import customSolutionsImg from './images/custom_ai_solutions.png';

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  imagePrompt: string;
  demoUrl: string;
  tags: string[];
}

export const SERVICES: Service[] = [
  {
    id: 'voice-agent',
    title: 'Voice Agent',
    description: 'Human-like conversational AI for customer support and sales, capable of handling complex queries with natural intonation.',
    image: voiceAgentImg,
    imagePrompt: 'A futuristic AI voice agent: glowing humanoid robot speaking into a sleek microphone, surrounded by animated sound waves and speech waveform visualizations, neural network nodes in the background, dark background with neon blue and gold accents, ultra-clean 3D render',
    demoUrl: 'https://pizzadelivery.thinkverseai.ca',
    tags: ['NLP', 'TTS', 'STT']
  },
  {
    id: 'rag-agents',
    title: 'RAG Agents',
    description: 'Retrieval-Augmented Generation systems that connect your private data to LLMs for accurate, context-aware responses.',
    image: ragAgentsImg,
    imagePrompt: 'A futuristic RAG AI system: glowing vector database with floating document embeddings being retrieved by a neural network, knowledge graph with interconnected nodes and data streams flowing into a large language model brain, dark background with neon green accents, ultra-clean 3D render',
    demoUrl: 'https://windmason.thinkverseai.ca',
    tags: ['Vector DB', 'LLM', 'Knowledge Base']
  },
  {
    id: 'marketing-automation',
    title: 'Digital Marketing Automation',
    description: 'Automated Facebook and social media marketing workflows that optimize ad spend and lead generation using AI.',
    image: marketingImg,
    imagePrompt: 'A futuristic AI digital marketing automation dashboard: holographic social media ad panels with rising performance charts, automated workflow pipelines connecting Facebook and Instagram logos, AI targeting audience segments, neon gold and blue glow on dark background, ultra-clean 3D render',
    demoUrl: 'https://adautomation.thinkverseai.ca',
    tags: ['Automation', 'Ads', 'Social']
  },
  {
    id: 'schedulers',
    title: 'AI Schedulers',
    description: 'Intelligent booking and scheduling systems that manage calendars and appointments across multiple time zones.',
    image: schedulerImg,
    imagePrompt: 'A futuristic AI scheduling system: holographic calendar interface with glowing appointment slots being intelligently filled by an AI, multiple world time zones displayed simultaneously, robotic arm organizing a digital calendar, neon cyan accents on dark background, ultra-clean 3D render',
    demoUrl: 'https://luxsaloon.thinkverseai.ca',
    tags: ['Efficiency', 'Calendar', 'Planning']
  },
  {
    id: 'custom-solutions',
    title: 'Custom AI Solutions',
    description: 'Bespoke AI development tailored to your specific business needs, from computer vision to predictive analytics.',
    image: customSolutionsImg,
    imagePrompt: 'A futuristic custom AI development workspace: holographic code editor with neural network architecture diagrams, computer vision eye scanning data, predictive analytics graphs, modular AI building blocks assembling into a custom system, neon purple and gold accents on dark background, ultra-clean 3D render',
    demoUrl: '#',
    tags: ['Bespoke', 'Enterprise', 'Scalable']
  }
];

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  company: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    quote: "ThinkVerse AI transformed our customer support. Their voice agents sound incredibly natural and have reduced our response times by 70%.",
    company: 'TechFlow Solutions',
    avatar: 'https://picsum.photos/seed/sarah/100/100'
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    quote: "The RAG implementation they built for our internal knowledge base is a game-changer. Our engineers find answers in seconds instead of minutes.",
    company: 'Nexus Engineering',
    avatar: 'https://picsum.photos/seed/marcus/100/100'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    quote: "Their marketing automation tripled our lead generation efficiency on Facebook. The ROI was visible within the first month.",
    company: 'Vantage Media',
    avatar: 'https://picsum.photos/seed/elena/100/100'
  },
  {
    id: '4',
    name: 'David Park',
    quote: "The AI scheduler is seamless. It handles our complex multi-timezone bookings without a single error. Highly recommended!",
    company: 'Global Connect',
    avatar: 'https://picsum.photos/seed/david/100/100'
  }
];
