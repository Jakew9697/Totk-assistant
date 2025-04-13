import React from 'react';
import { Card, Image } from 'react-bootstrap';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.avatarContainer}>
        <Image 
          src={isUser ? '/avatar-user.png' : '/avatar-zelda.png'} 
          alt={isUser ? 'User' : 'Assistant'}
          width={40}
          height={40}
          className={styles.avatar}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
          }}
        />
      </div>      <Card className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        <Card.Body>
          <Card.Text as="div">
            {isUser ? (
              content
            ) : (
              content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MessageBubble;
