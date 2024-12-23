# Inference Worker MCP Server

This program acts as a bridge between other software and the Cerebras AI inference platform. Think of it as a helper that takes tasks from another program, sends them to Cerebras for processing using powerful AI models, and then gives the results back to the original program.

## Core Functions

This MCP server provides the following core functionalities:

- **Task Submission:** Allows users to submit tasks to the Cerebras AI inference platform.
- **Task Submission:** Allows users to submit tasks to the Cerebras AI inference platform.
- **Task Decomposition:** (Pending) Breaks down complex tasks into smaller, well-defined sub-tasks for parallel processing.
- **Orchestration:** (Pending) Manages the parallel processing of sub-tasks using worker modules.
- **Result Aggregation:** (Pending) Collects and compiles results from worker modules.
- **Inference Processing:** Handles communication with the Cerebras AI API to execute tasks.
- **Inference Processing:** Handles communication with the Cerebras AI API to execute tasks.

## Process Flow

The following steps outline the process flow for handling user tasks:

1. **Task Submission:** A user submits a task to the MCP server (Cline).
2. **Task Analysis:** Cline analyzes the submitted task to determine if it requires decomposition and parallel processing.
3. **Orchestration (if needed):**
   - **Decomposition:** Cline breaks down the task into smaller sub-tasks.
   - **Task Distribution:** The orchestrator module distributes these sub-tasks to available worker modules.
   - **Parallel Processing:** Worker modules process their assigned sub-tasks concurrently.
   - **Result Collection:** The orchestrator collects the results from the worker modules.
   - **Result Aggregation:** The orchestrator sends the collected results back to Cline.
   - **Compilation:** Cline compiles the individual results into a final output.
4. **Direct Inference (if no orchestration):** If the task doesn't require orchestration, Cline directly communicates with the Cerebras AI API.
5. **Response Delivery:** Cline sends the final result back to the user.

## Getting Started

### Prerequisites

- Node.js and npm installed
- A Cerebras AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd inference-worker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory of the project.
2. Add your Cerebras AI API key to the `.env` file:
   ```
   CEREBRAS_API_KEY=YOUR_CEREBRAS_API_KEY
   ```

### Running the Server

```bash
npm run build
npm start
```

### Available Tools

#### submit_task

Submits a task to the inference platform. This tool is intended to be used by the orchestrator module.

**Input:**

```json
{
  "task": "Specific task to be processed by the inference platform"
}
```

**Example:**

```json
{
  "task": "Translate 'Hello, world!' to Spanish."
}
```

## License

MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
