import { Suspense } from "react";
import ChatBot from "./components/ChatBot";

export default function Home() {
  return (
    <Suspense>
      <ChatBot />
    </Suspense>
  );
}
