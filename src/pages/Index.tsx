import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickActions from "@/components/QuickActions";
import { Plane, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages([
                  ...newMessages,
                  { role: "assistant", content: assistantMessage },
                ]);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming chat:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (message: string) => {
    streamChat(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky via-background to-sky/50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-ocean shadow-ocean">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              TravelBot
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your AI-powered travel companion for amazing adventures
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-elevated p-6 mb-6 border border-border">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-in fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-ocean mb-4 shadow-ocean">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Start Your Journey</h2>
              <p className="text-muted-foreground mb-8">
                Ask me anything about travel, destinations, or trip planning!
              </p>
              <QuickActions onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          ) : (
            <>
              <div className="max-h-[500px] overflow-y-auto mb-6 space-y-2 pr-2">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center shadow-ocean">
                      <Plane className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="bg-card rounded-2xl px-4 py-3 shadow-soft border border-border">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <QuickActions onSelect={handleSendMessage} disabled={isLoading} />
            </>
          )}
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
