#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import config from 'config';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const CEREBRAS_API_KEY = config.get<string>('cerebras.apiKey');
const CEREBRAS_API_BASE_URL = config.get<string>('cerebras.baseUrl');
const INFERENCE_PLATFORM_CONTEXT_LIMIT = 8192;

if (!CEREBRAS_API_KEY) {
  logger.warn("CEREBRAS_API_KEY is not set in the configuration. The server will not be able to communicate with the inference platform.");
}

const inferenceClient = axios.create({
  baseURL: CEREBRAS_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
    'Content-Type': 'application/json',
  }
});


const server = new Server(
  {
    name: "inference-worker",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

interface SubmitTaskArguments {
  task: string;
}

const isValidSubmitTaskArgs = (args: any): args is SubmitTaskArguments =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.task === 'string';

interface CreateNoteArguments {
  title: string;
  content: string;
}

const isValidCreateNoteArgs = (args: any): args is CreateNoteArguments =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.title === 'string' &&
  typeof args.content === 'string';

const estimateTokens = (text: string) => {
  return Math.ceil(text.length / 4);
};

const submitTaskToInferencePlatform = async (task: string) => {
  try {
    if (!CEREBRAS_API_KEY) {
      logger.error("Error: CEREBRAS_API_KEY not set.");
      return "Error: Inference platform API key not configured.";
    }

    const response = await inferenceClient.post('/chat/completions', {
      messages: [
        { role: "user", content: task }
      ],
      model: "llama-3.3-70b",
      max_tokens: 1000
    });

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message?.content || 'No content in response';
    } else {
      logger.warn("No response from inference platform API");
      return "No response from the inference platform.";
    }
  } catch (error: any) {
    logger.error("Error communicating with inference platform API:", error);
    return `Error processing task: ${error.message}`;
  }
};

const submitTask = async (task: string) => {
  logger.info(`submitTask called with task: "${task}"`);

  if (estimateTokens(task) > INFERENCE_PLATFORM_CONTEXT_LIMIT) {
    return "Error: Task exceeds token limit.";
  }

  return await submitTaskToInferencePlatform(task);
};


server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'submit_task',
            description: 'Submits a task to the inference platform for processing.',
            inputSchema: {
                type: 'object',
                properties: {
                    task: {
                        type: 'string',
                        description: 'The task to submit to the inference platform (under 8192 tokens).',
                    },
                },
                required: ['task'],
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info(`CallToolRequestSchema handler called for tool: ${request.params.name}`);

  if (request.params.name === 'submit_task') {
    if (!isValidSubmitTaskArgs(request.params.arguments)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for submit_task');
    }
    const task = request.params.arguments.task;
    const result = await submitTask(task);
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Tool ${request.params.name} not found`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.error('Inference worker MCP server running on stdio');
}

main().catch((error) => {
  logger.error("Server error:", error);
  process.exit(1);
});
