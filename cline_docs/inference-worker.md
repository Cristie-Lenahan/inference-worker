# Inference Worker MCP Server

## Description
This MCP server provides a tool to interact with an external inference platform.

## Tools

### submit_task
Submits a task to the inference platform for processing.

**Input:**
```json
{
  "task": "The task to submit to the inference platform."
}
```

**Details:**
- The task is sent to the Cerebras inference platform.
- Requires the `CEREBRAS_API_KEY` and `CEREBRAS_API_BASE_URL` to be configured.
- The maximum length of the task is limited to 8192 tokens.

## Resources
No resources are currently defined.
