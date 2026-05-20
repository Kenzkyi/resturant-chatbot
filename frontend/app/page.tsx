import { Suspense } from "react";
import ChatBot from "./components/ChatBot";
import Loading from "./components/Loading";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatBot />
    </Suspense>
  );
}
