import { test } from 'node:test';
import assert from 'node:assert/strict';

type Conversation = Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;

process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? 'test-key';

const { buildAnthropicMessages } = await import('./aiService');

test('buildAnthropicMessages combines system prompts into the request payload', () => {
  const conversation: Conversation = [
    { role: 'system', content: 'You are a concise assistant.' },
    { role: 'user', content: 'Summarise the agenda.' },
    { role: 'assistant', content: 'Agenda summary placeholder.' },
    { role: 'system', content: 'Respond using bullet points.' },
    { role: 'user', content: 'List follow-up items.' },
  ];

  const { apiMessages, systemPrompt } = buildAnthropicMessages(conversation);

  assert.equal(systemPrompt, 'You are a concise assistant.\n\nRespond using bullet points.');
  assert.deepEqual(apiMessages, [
    { role: 'user', content: 'Summarise the agenda.' },
    { role: 'assistant', content: 'Agenda summary placeholder.' },
    { role: 'user', content: 'List follow-up items.' },
  ]);
});

test('buildAnthropicMessages returns a user/assistant only history when no system prompts are present', () => {
  const conversation: Conversation = [
    { role: 'user', content: 'Hello there!' },
    { role: 'assistant', content: 'Hi! How can I help?' },
  ];

  const { apiMessages, systemPrompt } = buildAnthropicMessages(conversation);

  assert.equal(systemPrompt, '');
  assert.deepEqual(apiMessages, conversation);
});
