import express, { Request, Response } from 'express';
import { findSimilarVectors, insertData } from './db';
import { generateEmbedding } from './embeddings';
import { SYSTEM_PROMPT } from './constants';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { z } from 'zod';

const app = express();
app.use(express.json());

const synthesizedOutput = z.object({
    context: z.string().describe('The context provided by the assistant.'),
    thought_process: z.array(z.string()).describe("List of thoughts that the AI assistant had while synthesizing the answer"),
    answer: z.string().describe("The synthesized answer to the user's question"),
    enough_context: z.boolean().describe("Whether the assistant has enough context to answer the question"),
});

app.post('/search', async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }

    try {
        const embedding = await generateEmbedding(query);
        const similarVectors = await findSimilarVectors(JSON.stringify(embedding));
        res.json(similarVectors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.post('/add', async (req: Request, res: Response) => {
    const { content, metadata } = req.body;
    if (!content || !metadata) {
        res.status(400).json({ error: 'Content and metadata is required' });
        return;
    }

    try {
        const embedding = await generateEmbedding(content);
        await insertData(metadata, content, JSON.stringify(embedding));
        res.json({ message: 'Data added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.post('/synthesized_output', async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }

    try {
        const embedding = await generateEmbedding(query);
        const similarVectors = await findSimilarVectors(JSON.stringify(embedding));

        const context = similarVectors.map(v => v.content).join('\n');

        const model = new ChatOpenAI({
            modelName: 'gpt-4',
            temperature: 0,
        });

        const modelWithSynthesizedOutput = model.withStructuredOutput(synthesizedOutput);

        const result = await modelWithSynthesizedOutput.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(query),
            new AIMessage(context),
        ]);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
