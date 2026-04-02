export async function askClaude(prompt: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect to Claude');
    }

    const data = await response.json();
    // Claude SDK returns a Message object, the content is in data.content[0].text
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }
    return 'No response from Claude';
  } catch (error: any) {
    console.error('Claude Service Error:', error);
    throw error;
  }
}
