"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  Navbar,
  Nav,
  Col,
  Row,
} from "react-bootstrap";
import { useChat } from "@/hooks/useChat";
import styles from "./ModernChatInterface.module.css";

const ModernChatInterface: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <Navbar
          bg="dark"
          variant="dark"
          expand="lg"
          className={`${styles.chatHeader} mb-5`} 
        >
          <Container fluid className="justify-content-center">
            <Row className="w-100 d-flex flex-column flex-lg-row align-items-center justify-content-lg-between">
              <Col className="text-center text-lg-start">
                <Navbar.Brand href="#" className="me-0">
                  <span className={styles.chatTitleText}>
                    Tears of the Kingdom Assistant
                  </span>
                </Navbar.Brand>
              </Col>
              <Col className="mt-2 mt-lg-0 text-center text-lg-end">
                <Nav className="justify-content-center justify-content-lg-end">
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={clearChat}
                    className={styles.clearButton}
                  >
                    New Chat
                  </Button>
                </Nav>
              </Col>
            </Row>
          </Container>
        </Navbar>
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>🏰</div>
              <h3 className={styles.welcomeTitle}>
                Welcome to your Zelda Guide!
              </h3>
              <p className={styles.welcomeDescription}>
                Ask me anything about Tears of the Kingdom – locations, puzzles,
                weapons, cooking recipes, or tips for your adventure through
                Hyrule!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              if (msg.role === "system") return null;

              return (
                <div
                  key={index}
                  className={`${styles.message} ${
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageSender}>
                    {msg.role === "user" ? "You" : "Zelda Guide"}
                  </div>
                  <div
                    className={`${styles.messageContent} ${
                      msg.role === "user"
                        ? styles.userMessageContent
                        : styles.assistantMessageContent
                    }`}
                  >
                    {msg.role === "user"
                      ? msg.content
                      :
                        msg.content.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.content.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className={styles.loadingContainer}>
              <Spinner animation="border" variant="light" size="sm" />
              <span className={styles.loadingText}>
                Consulting the ancient texts...
              </span>
            </div>
          )}

          {error && (
            <Alert variant="danger" className={styles.errorAlert}>
              {error}
            </Alert>
          )}

          <div ref={endOfMessagesRef} />
        </div>

        <div className={`${styles.inputContainer} justify-content-center`}>
          <Form onSubmit={handleSubmit} className={styles.inputForm}>
            <Form.Control
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Tears of the Kingdom..."
              disabled={isLoading}
              className={`${styles.messageInput} text-white`}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={styles.sendButton}
            >
              {isLoading ? <Spinner animation="border" size="sm" /> : "Ask"}
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ModernChatInterface;
