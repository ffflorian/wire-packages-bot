import { MessageHandler } from '@wireapp/bot-api';

class SearchHandler extends MessageHandler {
  async handleText(
    conversationId: string,
    fromId: string,
    text: string
  ): Promise<void> {
    switch (text) {
      case '/conversation':
        const conversationText = `The ID of this conversation is "${conversationId}".`;
        await this.sendText(conversationId, conversationText);
        break;
      case '/user':
        const userText = `Your user ID is "${fromId}".`;
        await this.sendText(conversationId, userText);
        break;
    }
  }
  async handleConnectionRequest(
    userId: string,
    userName: string
  ): Promise<void> {}
}

export { SearchHandler };
