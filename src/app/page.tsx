"use client"; 
import "bootstrap/dist/css/bootstrap.min.css";
import {Container} from "react-bootstrap"
import ModernChatInterface from "@/components/ModernChatInterface";

export default function Home() {
  return (
    <Container fluid className="p-0 m-0">
      <ModernChatInterface />
    </Container>
  );
}
