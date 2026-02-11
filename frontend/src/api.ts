import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface Tool {
    name: string;
    description?: string;
    inputSchema?: any;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const api = {
    checkHealth: async () => {
        const response = await axios.get('http://localhost:8000/health');
        return response.data;
    },

    listTools: async (): Promise<{ tools: Tool[] }> => {
        const response = await axios.get(`${API_URL}/tools`);
        return response.data;
    },

    callTool: async (toolName: string, args: any) => {
        const response = await axios.post(`${API_URL}/tools/${toolName}`, args);
        return response.data;
    },

    chat: async (messages: ChatMessage[]) => {
        const response = await axios.post(`${API_URL}/chat`, { messages });
        return response.data;
    }
};
