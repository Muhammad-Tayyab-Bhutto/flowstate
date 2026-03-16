import { FastifyPluginAsync } from 'fastify';
import { generateJson } from '../lib/vertex.js';

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('preHandler', fastify.authenticate);

    fastify.get<{ Reply: { success: boolean; data?: any; error?: string } }>(
        '/matches',
        async (request, reply) => {
            try {
                const userId = (request.user as any).uid || (request.user as any).id || (request.user as any).sub;

                // Fetch user profile from Firebase
                const userDoc = await fastify.firestore.collection('users').doc(userId).get();
                if (!userDoc.exists) {
                    return reply.status(404).send({ success: false, error: 'User profile not found' });
                }

                const userData = userDoc.data() as { profile?: any, name?: string };
                const profile = userData.profile || {};

                // Build context for the AI
                const profileContext = `
Name: ${userData.name || 'User'}
Skills: ${profile.skills?.join(', ') || 'Not specified'}
Experience Level: ${profile.experience_level || 'Not specified'}
Preferred Roles: ${profile.preferred_roles?.join(', ') || 'Not specified'}
Location: ${profile.location || 'Not specified'}
Work Types: ${profile.work_types?.join(', ') || 'Remote, Onsite, Hybrid'}
`;

                const prompt = `
You are an elite Tech Recruiter AI. Based on the following user profile, generate exactly 10 highly relevant, realistic job openings that perfectly match their skills and preferences. 
This is for a hackathon demo, so make the companies sound like real, well-known tech companies or high-growth startups (e.g., Stripe, Vercel, OpenAI, Google, local startups).

User Profile:
${profileContext}

Generate a JSON array of 10 job objects. Each object must have:
- title: (string) The job title (e.g., "Senior Frontend Engineer")
- company: (string) The company name
- location: (string) The city/country or "Anywhere"
- type: (string) Must be exactly one of: "Remote", "Onsite", "Hybrid"
- matchPercentage: (number) Between 85 and 99, representing how well they match
- salary: (string) Realistic salary range (e.g., "$120k - $160k")
- reason: (string) A short 1-2 sentence convincing reason WHY they are a perfect match based on their specific skills from the profile.

Return ONLY the JSON array, no markdown formatting.`;

                const responseJson = await generateJson(prompt);

                return reply.send({ success: true, data: responseJson });

            } catch (error) {
                request.log.error(error);
                return reply.status(500).send({ success: false, error: 'Failed to generate job matches' });
            }
        }
    );
};
